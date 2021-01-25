const core = require('@actions/core');
const exec = require('@actions/exec');

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

    if (!tags) {
        throw new Error('No source "tags" provided')
    }

    console.log(`Install update-aws-ecs-service`);
    await exec.exec('wget https://github.com/Autodesk/go-awsecs/releases/download/v1.3.1/update-aws-ecs-service-linux-amd64.zip');
    await exec.exec('sudo unzip update-aws-ecs-service-linux-amd64.zip -d /usr/bin');
    await exec.exec('sudo chmod +x /usr/bin/update-aws-ecs-service');

    console.log(`Login to AWS ECR`);
    await exec.exec('aws ecr get-login-password --region eu-central-1','',options);
    await exec.exec(`docker login --username AWS --password ${myOutput} 049470867734.dkr.ecr.eu-central-1.amazonaws.com`);
    // await exec.exec('aws ecr get-login-password --region eu-central-1 | docker login --username AWS --password-stdin 049470867734.dkr.ecr.eu-central-1.amazonaws.com');
    throw new Error('stop')

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