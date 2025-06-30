frontend-web:
    cd frontend && pnpm i && pnpm web

frontend-ios: 
    cd frontend && pnpm i && pnpm ios 

infra-deploy:
    cd infra && pulumi up --color always --yes

backend-deploy:
    gcloud auth configure-docker asia-northeast1-docker.pkg.dev
    cd backend && \
    docker buildx build --platform linux/amd64 --provenance=false \
    -t asia-northeast1-docker.pkg.dev/$GOOGLE_CLOUD_PROJECT/bth-dev-repo/bth-dev-service:latest . && \
    docker push asia-northeast1-docker.pkg.dev/$GOOGLE_CLOUD_PROJECT/bth-dev-repo/bth-dev-service:latest

cloudrun-deploy:
    gcloud run deploy adk-agent \
        --region asia-northeast1 \
        --project $GOOGLE_CLOUD_PROJECT \
        --image asia-northeast1-docker.pkg.dev/$GOOGLE_CLOUD_PROJECT/bth-dev-repo/bth-dev-service:latest \
        --service-account bth-dev-cloudrun@$GOOGLE_CLOUD_PROJECT.iam.gserviceaccount.com \
        --allow-unauthenticated \
        --set-env-vars="CLOUD_STORAGE_BUCKET=bth-dev-storage,DEBUG=false"

update-frontend-env:
    #!/usr/bin/env bash
    CLOUD_RUN_URL=$(gcloud run services describe adk-agent --region=asia-northeast1 --format="value(status.url)")
    sed -i.bak "s|API_ENDPOINT_URL=.*|API_ENDPOINT_URL=$CLOUD_RUN_URL|" frontend/.env
    echo "Updated frontend/.env with Cloud Run URL: $CLOUD_RUN_URL"

frontend-deploy:
    cd frontend && \
    pnpm install && \
    npx expo export --platform web && \
    gsutil -m cp -r dist/* gs://bth-dev-hosting/ && \
    gsutil iam ch allUsers:objectViewer gs://bth-dev-hosting

deploy-all:
    just backend-deploy
    just cloudrun-deploy
    just update-frontend-env
    just frontend-deploy
