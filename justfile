frontend-web:
    cd frontend && pnpm i && pnpm web

frontend-ios: 
    cd frontend && pnpm i && pnpm ios 

backend-deploy:
    cd backend && \
    docker build -t asia-northeast1-docker.pkg.dev/eternal-photon-292207/bth-dev-repo/handler:latest . && \
    docker push asia-northeast1-docker.pkg.dev/eternal-photon-292207/bth-dev-repo/handler:latest

cloudrun-deploy:
    gcloud run deploy bth-dev-service \
        --image=asia-northeast1-docker.pkg.dev/eternal-photon-292207/bth-dev-repo/handler:latest \
        --region=asia-northeast1 \
        --platform=managed \
        --allow-unauthenticated \
        --set-env-vars=BUCKET_NAME=bth-dev-storage \
        --memory=256Mi \
        --cpu=1

update-frontend-env:
    #!/usr/bin/env bash
    CLOUD_RUN_URL=$(gcloud run services describe bth-dev-service --region=asia-northeast1 --format="value(status.url)")
    sed -i.bak "s|API_ENDPOINT_URL=.*|API_ENDPOINT_URL=$CLOUD_RUN_URL|" frontend/.env
    echo "Updated frontend/.env with Cloud Run URL: $CLOUD_RUN_URL"

frontend-deploy:
    cd frontend && \
    pnpm i && \
    pnpm build && \
    gsutil -m cp -r dist/* gs://bth-dev-hosting/

deploy-all:
    just backend-deploy
    just cloudrun-deploy
    just update-frontend-env
    just frontend-deploy
