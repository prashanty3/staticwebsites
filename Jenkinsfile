pipeline {
    agent any
    environment {
        FTP_SERVER = "145.223.17.179"
        FTP_PORT = "21"
        FTP_USERNAME = "u964324091"
        FTP_REMOTE_DIR = "public_html"
        FTP_CREDENTIALS_ID = "hostinger-ftp-credentials"
        DEPLOYMENT_URL = "https://shobhityadav.com"
    }

    stages {
        stage('Install LFTP') {
            steps {
                sh 'sudo apt-get update && sudo apt-get install -y lftp'
            }
        }

        stage('Checkout Code') {
            steps {
                git credentialsId: 'github-token-new-new', url: 'https://github.com/prashanty3/staticwebsites.git'
            }
        }

        stage('Validate FTP Access') {
            steps {
                script {
                    withCredentials([usernamePassword(
                        credentialsId: "${env.FTP_CREDENTIALS_ID}",
                        usernameVariable: 'FTP_USER',
                        passwordVariable: 'FTP_PASS'
                    )]) {
                        sh """
                            lftp -u "\$FTP_USER","\$FTP_PASS" -e "
                                set ftp:ssl-allow no;
                                ls ${env.FTP_REMOTE_DIR};
                                quit
                            " ${env.FTP_SERVER}
                        """
                    }
                }
            }
        }

        stage('Backup Remote Files') {
            steps {
                script {
                    withCredentials([usernamePassword(
                        credentialsId: "${env.FTP_CREDENTIALS_ID}",
                        usernameVariable: 'FTP_USER',
                        passwordVariable: 'FTP_PASS'
                    )]) {
                        sh """
                            lftp -u "\$FTP_USER","\$FTP_PASS" -e "
                                set ftp:ssl-allow no;
                                mirror --reverse --delete ${env.FTP_REMOTE_DIR} ${env.FTP_REMOTE_DIR}_backup_\$(date +'%Y%m%d');
                                quit
                            " ${env.FTP_SERVER}
                        """
                    }
                }
            }
        }

        stage('Deploy to Hostinger') {
            steps {
                script {
                    retry(3) {
                        timeout(time: 15, unit: 'MINUTES') {
                            ftpUpload(
                                server: "${env.FTP_SERVER}",
                                port: "${env.FTP_PORT}",
                                username: "${env.FTP_USERNAME}",
                                credentialsId: "${env.FTP_CREDENTIALS_ID}",
                                sourceFiles: "**/*",
                                remoteDirectory: "${env.FTP_REMOTE_DIR}",
                                cleanRemote: false,
                                asciiMode: false
                            )
                        }
                    }
                }
            }
        }

        stage('Smoke Test') {
            steps {
                script {
                    sleep(time: 10, unit: 'SECONDS')
                    def status = sh(
                        script: "curl -s -o /dev/null -w '%{http_code}' ${env.DEPLOYMENT_URL}",
                        returnStdout: true
                    ).trim()
                    if (status != "200") {
                        error "❌ Deployment failed: Site returned HTTP ${status}"
                    }
                    echo "✅ Smoke test passed (HTTP 200)"
                }
            }
        }
    }

    post {
        always {
            echo "🚀 Deployment completed with status: ${currentBuild.currentResult}"
        }
        success {
            echo "✅ Deployment succeeded!"
        }
        failure {
            echo "❌ Deployment failed!"
        }
    }
}