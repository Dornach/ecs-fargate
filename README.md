# deploy-aws-action

The script uses files: configure-aws-credentials@v1

https://github.com/aws-actions/configure-aws-credentials

## Sample use
```yaml
      #downloading a private script
      - name: Get private repo with action
        uses: actions/checkout@v2
        env:
          GIT_TRACE: 1
          GIT_CURL_VERBOSE: 1
          GIT_TERMINAL_PROMPT: 1
        with:
          repository: ZieglerLabs/deploy-aws-action
          token: ${{ secrets.GH_PUBLISH_TOKEN }}
          path: actionsDeployAWS

      - name: Update an AWS ECS service with the new image
        uses: ./actionsDeployAWS
        with:
          tags: '[{"name":"api","tag":"ziegler-cards-api","imageName":"card-creator-api-prod"},{"name":"frontend","tag":"ziegler-cards-frontend","imageName":"card-creator-frontend-prod"},{"name":"server","tag":"ziegler-cards-server","imageName":"card-creator-server-prod"}]'
          service: 'ziegler-cards-creator'
          cluster: 'ziegler-cards-cluster'
          build-command: 'docker-compose -f docker/docker-compose.prod.yml build'
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_ACCESS_KEY }}
          aws-region: eu-central-1

```
