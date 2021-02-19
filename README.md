# Orchestrate Some Microservices!

This is a laboratory for you to see Kubernetes files in action. Follow the
steps, below, then check out the files in the **deploy/** directory. 

## Clean up the environment

Remove any old minikubes.

```sh
minikube stop
minikube delete
```

## Get the environment set up

Start a fresh minikube. You may need to change your Docker Desktop (or Engine)
settings or the values in this command line based on the amount of memory and
CPUs that you have available.

```sh
minikube start --memory 8192 --cpus=4
```

If you're using Lens, you can now connect to the minikube instance.

Allow Kubernetes to pull images from the local minikube environment. You will usually only do this if you're interested in local development. If you're using other people's images, then you'll normally get those from Docker Hub. **Don't automatically do this all the time.**

```sh
eval $(minikube docker-env)
```

## Build local Docker images

Build the three images so Kubernetes won't go to a registry to try to get them.
_These images only get picked up by Kubernetes because of the `eval` statement that was the last command._

Build the API service.

```sh
cd api
docker build -t orchestrated-api .
cd ..
```

Build the authentication service.

```sh
cd auth
docker build -t orchestrated-auth .
cd ..
```

Build the interface.

```sh
cd ghi
docker build -t orchestrated-ghi .
cd ..
```

## Install an Ingress Controller

The Ingress controller is going to be the Nginx Ingress controller. To create
one, use the following command.

```sh
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v0.44.0/deploy/static/provider/cloud/deploy.yaml
```

## Create the Kubernetes objects for this application

```sh
kubectl apply -f deploy/
```

Now, you can run this command to get a URL to try out the application.

```sh
minikube service -n ingress-nginx ingress-nginx-controller --url
```

## Clean up

To clean up, just remove the minikube.

```sh
minikube stop
minikube delete
```
