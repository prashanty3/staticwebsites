pipeline {
    agent any

    environment {
        FTP_HOST = 'ftp.shobhityadav.com'
        FTP_USERNAME = 'u964324091'
        FTP_PASSWORD = 'Saumyashant@2615'
        LOCAL_DIR = '.'
        REMOTE_DIR = '.'  // ✅ Just root after FTP login
        SITE_URL = 'https://shobhityadav.com'
    }

    stages {
        stage('Checkout Code') {
            steps { 
                git credentialsId: 'github-token', url: 'https://github.com/prashanty3/staticwebsites.git'
            }
        }

        stage('Prepare Deployment') {
            steps {
                sh '''
                echo "📂 Verifying workspace contents:"
                ls -la
                echo "Creating test file..."
                echo "Test file from Jenkins - $(date)" > test_file.txt
                
                # Set correct permissions
                find . -type f -name "*.html" -exec chmod 644 {} \\;
                find . -type f -name "*.css" -exec chmod 644 {} \\;
                find . -type f -name "*.js" -exec chmod 644 {} \\;
                find . -type f -name "*.jpg" -exec chmod 644 {} \\;
                find . -type f -name "*.png" -exec chmod 644 {} \\;
                find . -type f -name "*.gif" -exec chmod 644 {} \\;
                '''
            }
        }

        stage('Deploy to Hostinger') {
            steps {
                sh '''
                echo "🔄 Deploying files to Hostinger FTP..."

                # Upload HTML files
                find . -type f -name "*.html" | while read file; do
                    echo "Uploading $file..."
                    curl --ftp-ssl-reqd --insecure \
                        --user "$FTP_USERNAME:$FTP_PASSWORD" \
                        -T "$file" \
                        "ftp://$FTP_HOST/$(basename "$file")"
                done

                # Upload CSS files
                if [ -d "./css" ]; then
                    find ./css -type f -name "*.css" | while read file; do
                        echo "Uploading $file..."
                        curl --ftp-ssl-reqd --insecure \
                            --user "$FTP_USERNAME:$FTP_PASSWORD" \
                            -T "$file" \
                            "ftp://$FTP_HOST/css/$(basename "$file")"
                    done
                fi

                # Upload JS files
                if [ -d "./js" ]; then
                    find ./js -type f -name "*.js" | while read file; do
                        echo "Uploading $file..."
                        curl --ftp-ssl-reqd --insecure \
                            --user "$FTP_USERNAME:$FTP_PASSWORD" \
                            -T "$file" \
                            "ftp://$FTP_HOST/js/$(basename "$file")"
                    done
                fi

                # Upload images
                if [ -d "./images" ]; then
                    find ./images -type f \\( -iname "*.jpg" -o -iname "*.png" -o -iname "*.gif" \\) | while read file; do
                        echo "Uploading $file..."
                        curl --ftp-ssl-reqd --insecure \
                            --user "$FTP_USERNAME:$FTP_PASSWORD" \
                            -T "$file" \
                            "ftp://$FTP_HOST/images/$(basename "$file")"
                    done
                fi

                # Upload test file
                echo "Uploading test file..."
                curl --ftp-ssl-reqd --insecure \
                    --user "$FTP_USERNAME:$FTP_PASSWORD" \
                    -T "test_file.txt" \
                    "ftp://$FTP_HOST/test_file.txt"

                echo "✅ Deployment completed successfully."
                '''
            }
        }

        stage('Verify Deployment') {
            steps {
                sh '''
                echo "🔍 Verifying deployment..."
                sleep 5

                # Verify index.html
                HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$SITE_URL")
                if [ "$HTTP_CODE" -eq 200 ]; then
                    echo "✅ Website is accessible (HTTP 200 OK)"
                else
                    echo "⚠️ Website returned HTTP code: $HTTP_CODE"
                    echo "This might indicate a server configuration issue."
                fi

                # Verify test file
                TEST_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$SITE_URL/test_file.txt")
                if [ "$TEST_CODE" -eq 200 ]; then
                    echo "✅ Test file is accessible (HTTP 200 OK)"
                else
                    echo "⚠️ Test file returned HTTP code: $TEST_CODE"
                    echo "This might indicate a server configuration issue."
                fi
                '''
            }
        }
    }

    post {
        always {
            echo "💡 Troubleshooting information:"
            echo "1. Verify files were uploaded correctly in Hostinger File Manager."
            echo "2. Ensure 'index.html' is directly inside 'public_html'."
            echo "3. Clear browser cache if changes are not visible."
        }
        success {
            echo "✅ Deployment appears successful. Consider purging Hostinger cache if needed."
        }
        failure {
            echo "❌ Deployment failed. Please check logs above for errors."
        }
    }
}
