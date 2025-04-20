pipeline {
    agent any

    environment {
        FTP_SERVER = 'shobhityadav.com'
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
                sh '''
                echo "📂 Verifying workspace contents:"
                ls -al $LOCAL_DIR

                if ! command -v lftp > /dev/null 2>&1; then
                    echo "❌ 'lftp' is not installed."
                    exit 1
                fi

                echo "🔐 Testing FTP connection..."
                lftp -u "$FTP_USERNAME","$FTP_PASSWORD" "$FTP_SERVER" -e "
                    pwd;
                    ls;
                    mirror -R --delete --verbose $LOCAL_DIR public_html;
                    quit
                "
                '''
            }
        }


        stage('Post-Deployment') {
            steps {
                echo "🚀 Deployment completed!"
            }
        }
    }
}
