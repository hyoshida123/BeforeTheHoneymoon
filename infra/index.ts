import * as gcp from "@pulumi/gcp";
import * as pulumi from "@pulumi/pulumi";

const config = new pulumi.Config("gcp");
const project = config.require("project");
const region = config.get("region") ?? "asia-northeast1";
const env = pulumi.getStack();

const resourcePrefix = `bth-${env}`;

// 必要なAPIを有効にする
const enableArtifactAPI = new gcp.projects.Service("artifactregistry-api", {
    service: "artifactregistry.googleapis.com",
});
const enableRunAPI = new gcp.projects.Service("run-api", {
    service: "run.googleapis.com",
}, { dependsOn: [enableArtifactAPI] });
const enableStorageAPI = new gcp.projects.Service("storage-api", {
    service: "storage.googleapis.com",
});
const enableAIPlatformAPI = new gcp.projects.Service("aiplatform-api", {
    service: "aiplatform.googleapis.com",
});
const enableMLAPI = new gcp.projects.Service("ml-api", {
    service: "ml.googleapis.com",
});

// リポジトリの作成
const repoName = `${resourcePrefix}-repo`;
const repo = new gcp.artifactregistry.Repository(repoName, {
    repositoryId: repoName,
    format: "DOCKER",
    location: region,
    description: "Docker repo for Cloud Run images",
}, { dependsOn: [enableArtifactAPI] });

export const repositoryUrl = pulumi
    .interpolate`${region}-docker.pkg.dev/${project}/${repo.repositoryId}`;

// Cloud Run サービスアカウントの作成
const cloudRunServiceAccount = new gcp.serviceaccount.Account("cloudrun-service-account", {
    accountId: `bth-${env}-cloudrun`,
    displayName: "Cloud Run Service Account",
});

// Cloud Storageバケットの作成（画像保存用）
const imageBucketName = `${resourcePrefix}-storage`;
const imageBucket = new gcp.storage.Bucket(imageBucketName, {
    name: imageBucketName,
    location: region,
    storageClass: "STANDARD",
    versioning: {
        enabled: true,
    },
    cors: [{
        origins: ["*"],
        methods: ["GET", "HEAD", "PUT", "POST", "DELETE"],
        responseHeaders: ["*"],
        maxAgeSeconds: 3600,
    }],
}, { dependsOn: [enableStorageAPI] });

// Cloud Storageバケットの作成（ホスティング用）
const hostingBucketNameVar = `${resourcePrefix}-hosting`;
const hostingBucket = new gcp.storage.Bucket(hostingBucketNameVar, {
    name: hostingBucketNameVar,
    location: region,
    storageClass: "STANDARD",
    website: {
        mainPageSuffix: "index.html",
        notFoundPage: "index.html",
    },
    uniformBucketLevelAccess: true,
}, { dependsOn: [enableStorageAPI] });

// ホスティングバケットを公開
new gcp.storage.BucketIAMMember("hosting-public", {
    bucket: hostingBucket.name,
    role: "roles/storage.objectViewer",
    member: "allUsers",
}, { dependsOn: [hostingBucket] });

export const bucketName = imageBucket.name;
export const bucketUrl = pulumi.interpolate`gs://${imageBucket.name}`;
export const hostingBucketName = hostingBucket.name;
export const hostingBucketUrl = pulumi.interpolate`gs://${hostingBucket.name}`;

// Cloud Run サービスアカウントにCloud Storage権限を付与
new gcp.storage.BucketIAMMember("cloudrun-storage-admin", {
    bucket: imageBucket.name,
    role: "roles/storage.objectAdmin",
    member: pulumi.interpolate`serviceAccount:${cloudRunServiceAccount.email}`,
}, { dependsOn: [imageBucket, cloudRunServiceAccount] });

// Cloud Run サービスアカウントにAI Platform権限を付与（Gemini API使用のため）
new gcp.projects.IAMMember("cloudrun-aiplatform-user", {
    project: project,
    role: "roles/aiplatform.user",
    member: pulumi.interpolate`serviceAccount:${cloudRunServiceAccount.email}`,
}, { dependsOn: [cloudRunServiceAccount, enableAIPlatformAPI] });

// Cloud Run サービスアカウントにML Developer権限を付与（AI/MLサービス使用のため）
new gcp.projects.IAMMember("cloudrun-ml-developer", {
    project: project,
    role: "roles/ml.developer", 
    member: pulumi.interpolate`serviceAccount:${cloudRunServiceAccount.email}`,
}, { dependsOn: [cloudRunServiceAccount, enableMLAPI] });

// Cloud Run サービスアカウントにStorage Object Admin権限を付与（プロジェクトレベル）
new gcp.projects.IAMMember("cloudrun-storage-admin-project", {
    project: project,
    role: "roles/storage.objectAdmin",
    member: pulumi.interpolate`serviceAccount:${cloudRunServiceAccount.email}`,
}, { dependsOn: [cloudRunServiceAccount, enableStorageAPI] });
