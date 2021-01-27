# ecs-fargate

The script uses files: configure-aws-credentials@v1

https://github.com/aws-actions/configure-aws-credentials

## Sample use
```yaml
      - name: ecs-fargate
        uses: ZieglerLabs/ecs-fargate@v0.1
        with:
          tags: '[{"containerImage":"frontend","tag":"service_frontend"},{"containerImage":"api","tag":"service_api"}]'
          service: service_1
          cluster: cluster_1
          build-command: docker/docker-compose.prod.yml
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_ACCESS_KEY }}
          aws-region: eu-central-1
          ecr: ************.dkr.ecr.eu-central-1.amazonaws.com
```
