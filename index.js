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
    const awsRegion = core.getInput('aws-region');
    const ecr = core.getInput('ecr');

    await tags.map( val => {
        if(!val || !val.containerImage || !val.tag){
            console.log(JSON.stringify(val));
            console.log(JSON.stringify(tags));
            throw new Error('wrong "tags"')
        }
    })

    console.log(`Install update-aws-ecs-service`);
    await exec.exec('wget https://github.com/Autodesk/go-awsecs/releases/download/v1.3.1/update-aws-ecs-service-linux-amd64.zip');
    await exec.exec('sudo unzip update-aws-ecs-service-linux-amd64.zip -d /usr/bin');
    await exec.exec('sudo chmod +x /usr/bin/update-aws-ecs-service');

    if(buildCommand) {
        console.log(`Build the docker images with docker compose`);
        await exec.exec(`docker-compose -f ${buildCommand} build`)
    }

    console.log(`Login to AWS ECR`);
    await exec.exec(`aws ecr get-login-password --region ${awsRegion}`,'',options);
    await exec.exec(`docker login --username AWS --password ${myOutput} ${ecr}`);

    let updateAWSCommand=`update-aws-ecs-service -cluster ${cluster} -service ${service} `

    for(let i=0;i<tags.length;i++) {
        const val = tags[i]
        updateAWSCommand+=`-container-image ${val.containerImage}=${ecr}/${val.tag}:${val.env ? val.env : 'latest'} `
        console.log(`Tag ${val.tag}`)
        await exec.exec(`docker tag ${val.imageName ? val.imageName : val.tag}:${val.env ? val.env : 'latest'} ${ecr}/${val.tag}:${val.env ? val.env : 'latest'}`)
        await exec.exec(`docker push ${ecr}/${val.tag}:${val.env ? val.env : 'latest'}`)
    }

    console.log(`Update an AWS ECS service with the new image`);
    await exec.exec(updateAWSCommand)
    console.log(`CLUSTER UPDATE FINISHED`);

    console.log(`Cleanup`);
    core.exportVariable('AWS_ACCESS_KEY_ID', '');
    core.exportVariable('AWS_SECRET_ACCESS_KEY', '');
    core.exportVariable('AWS_SESSION_TOKEN', '');
    core.exportVariable('AWS_DEFAULT_REGION', '');
    core.exportVariable('AWS_REGION', '');

} catch (error) {
    core.setFailed(error.message);
}
})();