const core = require('@actions/core');
const exec = require('@actions/exec');
const io = require('@actions/io');
const fs = require('file-system');

(async () => { try {
    let myOutput = '';

    const options = {};
    options.listeners = {
        stdout: (data) => {
            myOutput += data.toString();
        }
    };

    const tags = JSON.parse(core.getInput('tags'));
    const service = core.getInput('service');
    const cluster = core.getInput('cluster');
    const buildCommand = core.getInput('build-command');
    const awsAccessKeyId = core.getInput('aws-access-key-id');
    const awsSecretAccessKey = core.getInput('aws-secret-access-key');
    const awsRegion = core.getInput('aws-region');

    console.log(`Configure AWS credentials`);
    // core.exportVariable('AWS_ACCESS_KEY_ID', awsAccessKeyId);
    // core.exportVariable('AWS_SECRET_ACCESS_KEY', awsSecretAccessKey);
    // core.exportVariable('AWS_REGION', awsRegion);
    // core.exportVariable('AWS_DEFAULT_REGION', awsRegion);

    const credentials=`[default]\naws_access_key_id = ${awsAccessKeyId}$\naws_secret_access_key = ${awsSecretAccessKey}`
    const config=`[default]\nregion = ${awsRegion}$`
    await exec.exec('ls -la /usr/local/bin')
    await fs.appendFileSync('/usr/local/bin/aws/credentials', credentials,(err)=>console.log(err));
    await exec.exec('ls -la /usr/local/bin/credentials')
    await fs.appendFileSync('/usr/local/bin/aws/config', config,(err)=>console.log(err));


    console.log(`Install update-aws-ecs-service`);
    await exec.exec('wget https://github.com/Autodesk/go-awsecs/releases/download/v1.3.1/update-aws-ecs-service-linux-amd64.zip');
    await exec.exec('sudo unzip update-aws-ecs-service-linux-amd64.zip -d /usr/bin');
    await exec.exec('sudo chmod +x /usr/bin/update-aws-ecs-service');

    console.log(`Login to AWS ECR`);
    await exec.exec('aws ecr get-login-password --region eu-central-1','',options);
    await exec.exec(`docker login --username AWS --password ${myOutput} 049470867734.dkr.ecr.eu-central-1.amazonaws.com`);

    console.log(`Build the docker images with docker compose`);
    await exec.exec(buildCommand)

    let updateAWSCommand=`update-aws-ecs-service -cluster ${cluster} -service ${service} `

    tags.map( async val => {
        updateAWSCommand+=`-container-image ${val.name}=049470867734.dkr.ecr.eu-central-1.amazonaws.com/${val.tag}:latest `
        console.log(`Tag ${val.tag}`)
        await exec.exec(`docker tag ${val.tag}:latest 049470867734.dkr.ecr.eu-central-1.amazonaws.com/${val.tag}:latest`)
        await exec.exec(`docker push 049470867734.dkr.ecr.eu-central-1.amazonaws.com/${val.tag}:latest`)
    })

    console.log(`Test: `+updateAWSCommand);

    // console.log(`Update an AWS ECS service with the new image`);
    // await exec.exec(updateAWSCommand)
    // console.log(`CLUSTER UPDATE FINISHED`);

} catch (error) {
    core.setFailed(error.message);
}
})();