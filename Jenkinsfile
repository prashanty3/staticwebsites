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
        stage('Verify Dependencies') {
            steps {
                script {
                    // Check if lftp is available
                    def lftpCheck = sh(script: 'which lftp || true', returnStdout: true).trim()
                    if (!lftpCheck) {
                        error("LFTP is not installed on this agent. Please use an agent with LFTP pre-installed or contact your administrator.")
                    }
                    
                    // Verify curl is available for smoke test
                    def curlCheck = sh(script: 'which curl || true', returnStdout: true).trim()
                    if (!curlCheck) {
                        error("Curl is not installed on this agent. Required for smoke tests.")
                    }
                }
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
                        sh '''
                            lftp -u "$FTP_USER","$FTP_PASS" -e "
                                set ftp:ssl-allow no;
                                ls ${env.FTP_REMOTE_DIR};
                                quit
                            " ${env.FTP_SERVER} || exit 1
                        '''.stripIndent()
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
                        sh '''
                            backup_dir="${env.FTP_REMOTE_DIR}_backup_$(date +'%Y%m%d')"
                            lftp -u "$FTP_USER","$FTP_PASS" -e "
                                set ftp:ssl-allow no;
                                mirror --reverse --delete ${env.FTP_REMOTE_DIR} $backup_dir;
                                quit
                            " ${env.FTP_SERVER}
                        '''.stripIndent()
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
            echo "🚀 Deployment pipeline completed with status: ${currentBuild.currentResult}"
            cleanWs() // Clean workspace after build
        }
        success {
            echo "✅ Success: Website deployed to ${env.DEPLOYMENT_URL}"
        }
        failure {
            echo "❌ Failure: Deployment to ${env.DEPLOYMENT_URL} failed"
        }
    }
}