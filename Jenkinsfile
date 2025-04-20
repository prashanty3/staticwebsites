pipeline {
    agent any

    environment {
        FTP_SERVER = '145.223.17.179'
        FTP_USERNAME = 'u964324091'
        FTP_PASSWORD = 'Saumyashant@2615'
        LOCAL_DIR = '.' 
    }

    stages {
        stage('Checkout Code') {
            steps { 
                git credentialsId: 'github-token-new-new', url: 'https://github.com/prashanty3/staticwebsites.git'
            }
        }

        stage('Security Scan (Optional)') {
            steps {
                echo "🔍 Skipping security scan — no dependencies"
            }
        }

        stage('Deploy to Hostinger') {
            steps {
                sh """
                 if ! command -v lftp &> /dev/null
                then
                    echo "❌ 'lftp' is not installed. Please install it on the Jenkins server manually."
                    sudo apt-get update
                    sudo apt-get install -y lftp
                    exit 1
                fi
                lftp -u $FTP_USERNAME,$FTP_PASSWORD $FTP_SERVER <<EOF
                mirror -R --delete $LOCAL_DIR /public_html/
                quit
                EOF
                """
            }
        }
    }
}
