// ─────────────────────────────────────────────────────────────
// SubSync Jenkinsfile — CI/CD Pipeline
// Team Member: Jenkins Setup
// Stages: Clone → Build → Test → Push to DockerHub
// ─────────────────────────────────────────────────────────────
pipeline {
    agent any

    environment {
        BACKEND_IMAGE = "rohithsarvesaash/subsync-backend"
        FRONTEND_IMAGE = "rohithsarvesaash/subsync-frontend"
        DOCKER_TAG = "${BUILD_NUMBER}"
    }

    stages {
        stage('Clone Repository') {
            steps {
                echo '📥 Cloning repository from GitHub...'
                git branch: 'dev',
                    url: 'https://github.com/rohithrajansarvesaa/occ-subsync.git'
            }
        }

        stage('Build Backend Image') {
            steps {
                echo '🐳 Building Backend Docker image...'
                dir('backend') {
                    sh "docker build -t ${BACKEND_IMAGE}:${DOCKER_TAG} ."
                    sh "docker tag ${BACKEND_IMAGE}:${DOCKER_TAG} ${BACKEND_IMAGE}:latest"
                }
            }
        }

        stage('Build Frontend Image') {
            steps {
                echo '🐳 Building Frontend Docker image...'
                dir('frontend') {
                    sh "docker build --build-arg VITE_API_URL=http://localhost:5000/api -t ${FRONTEND_IMAGE}:${DOCKER_TAG} ."
                    sh "docker tag ${FRONTEND_IMAGE}:${DOCKER_TAG} ${FRONTEND_IMAGE}:latest"
                }
            }
        }

        stage('Test Images') {
            steps {
                echo '🧪 Testing Docker images...'
                sh "docker run --rm ${BACKEND_IMAGE}:${DOCKER_TAG} node --version"
                sh "docker run --rm ${FRONTEND_IMAGE}:${DOCKER_TAG} nginx -v"
                echo '✅ Images validated successfully'
            }
        }

        stage('Push Backend to DockerHub') {
            steps {
                echo '📤 Pushing Backend image to DockerHub...'
                withDockerRegistry(credentialsId: 'dockerhub', url: '') {
                    sh "docker push ${BACKEND_IMAGE}:${DOCKER_TAG}"
                    sh "docker push ${BACKEND_IMAGE}:latest"
                }
            }
        }

        stage('Push Frontend to DockerHub') {
            steps {
                echo '📤 Pushing Frontend image to DockerHub...'
                withDockerRegistry(credentialsId: 'dockerhub', url: '') {
                    sh "docker push ${FRONTEND_IMAGE}:${DOCKER_TAG}"
                    sh "docker push ${FRONTEND_IMAGE}:latest"
                }
            }
        }

        stage('Clean Up') {
            steps {
                echo '🧹 Cleaning up local Docker images...'
                sh "docker rmi ${BACKEND_IMAGE}:${DOCKER_TAG} || true"
                sh "docker rmi ${BACKEND_IMAGE}:latest || true"
                sh "docker rmi ${FRONTEND_IMAGE}:${DOCKER_TAG} || true"
                sh "docker rmi ${FRONTEND_IMAGE}:latest || true"
            }
        }
    }

    post {
        success {
            echo '✅ Pipeline completed successfully!'
            echo "Backend: ${BACKEND_IMAGE}:${DOCKER_TAG}"
            echo "Frontend: ${FRONTEND_IMAGE}:${DOCKER_TAG}"
        }
        failure {
            echo '❌ Pipeline failed. Check logs above.'
        }
    }
}
