# ecs-fargate

The script uses files: configure-aws-credentials@v1

https://github.com/aws-actions/configure-aws-credentials

## Sample use
```yaml
      - name: ecs-fargate
        uses: ZieglerLabs/ecs-fargate@v0.1
        with:
          tags: '[{"containerImage":"api","tag":"ziegler-cards-api","imageName":"card-creator-api-prod"},{"containerImage":"frontend","tag":"ziegler-cards-frontend","imageName":"card-creator-frontend-prod"},{"containerImage":"server","tag":"ziegler-cards-server","imageName":"card-creator-server-prod"}]'
          service: ziegler-cards-creator
          cluster: ziegler-cards-cluster
          build-command: docker/docker-compose.prod.yml
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_ACCESS_KEY }}
          aws-region: eu-central-1
          ecr: ************.dkr.ecr.eu-central-1.amazonaws.com
```
