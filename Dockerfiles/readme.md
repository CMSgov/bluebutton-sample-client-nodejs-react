# Build, Tag, and Publish CI check and tests ECR iamge

Go to local repo base directory and do the followings (assume aws cli installed and configured properly):

```

aws ecr-public get-login-password --region us-east-1 | docker login --username AWS --password-stdin public.ecr.aws/f5g8o1y9
cd <node-js-react-sample-app-local-repo-base-dir>/Dockerfiles
docker build -f Dockerfile.jenkins -t bb2-node-js-react-sample-app-cbc-build .
docker tag bb2-node-js-react-sample-app-cbc-build:latest public.ecr.aws/f5g8o1y9/bb2-node-js-react-sample-app-cbc-build:latest
docker push public.ecr.aws/f5g8o1y9/bb2-node-js-react-sample-app-cbc-build:latest

```