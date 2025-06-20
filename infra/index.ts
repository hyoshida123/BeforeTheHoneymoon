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
const enableFunctionsAPI = new gcp.projects.Service("cloudfunctions-api", {
    service: "cloudfunctions.googleapis.com",
}, { dependsOn: [enableArtifactAPI] });
const enableStorageAPI = new gcp.projects.Service("storage-api", {
    service: "storage.googleapis.com",
});

// リポジトリの作成
const repoName = `${resourcePrefix}-repo`;
const repo = new gcp.artifactregistry.Repository(repoName, {
    repositoryId: repoName,
    format: "DOCKER",
    location: region,
    description: "Docker repo for Cloud Function images",
}, { dependsOn: [enableArtifactAPI] });

export const repositoryUrl = pulumi
    .interpolate`${region}-docker.pkg.dev/${project}/${repo.repositoryId}`;

// Cloud Storageバケットの作成
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

export const bucketName = imageBucket.name;
export const bucketUrl = pulumi.interpolate`gs://${imageBucket.name}`;

// 初回はコンテナイメージがないため、2回目のデプロイで関数を作成する
const FIRST: boolean = process.env.FIRST === "true" ? true : false;
let fn: gcp.cloudfunctions.Function | undefined;
if (!FIRST) {
    // TODO: あとで変更する
    const funcName = `${resourcePrefix}-function`;
    const fn = new gcp.cloudfunctions.Function(funcName, {
        name: funcName,
        region: region,
        runtime: "nodejs20",
        dockerRegistry: "ARTIFACT_REGISTRY",
        dockerRepository: pulumi.interpolate`${repositoryUrl}/handler:latest`,
        entryPoint: "handler",
        availableMemoryMb: 256,
        triggerHttp: true,
        ingressSettings: "ALLOW_ALL",
        environmentVariables: {
            BUCKET_NAME: imageBucket.name,
        },
    }, { dependsOn: [enableFunctionsAPI, repo] });

    new gcp.cloudfunctions.FunctionIamMember("fn-invoker", {
        project: fn.project,
        region: fn.region,
        cloudFunction: fn.name,
        role: "roles/cloudfunctions.invoker",
        member: "allUsers",
    });
}

export const functionUrl = fn?.httpsTriggerUrl || "dummy";
