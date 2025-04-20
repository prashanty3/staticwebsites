pipeline {
    agent any

    environment {
        FTP_SERVER = 'shobhityadav.com'
        FTP_USERNAME = 'u964324091'
        FTP_PASSWORD = 'Saumyashant@2615'
        LOCAL_DIR = '.'
        REMOTE_DIR = 'public_html'
    }

    stages {
        stage('Checkout Code') {
            steps { 
                git credentialsId: 'github-token-new-new', url: 'https://github.com/prashanty3/staticwebsites.git'
            }
        }

        stage('Prepare Deployment') {
            steps {
                sh '''
                echo "📂 Verifying workspace contents:"
                ls -la
                echo "Total files: $(find . -type f | wc -l)"
                
                # Create a test file to verify upload is working
                echo "Test file from Jenkins - $(date)" > jenkins_test_file.txt
                '''
            }
        }

        stage('Debug Remote Server') {
            steps {
                sh '''
                echo "🔍 Checking remote server structure..."
                
                lftp -u "$FTP_USERNAME","$FTP_PASSWORD" "$FTP_SERVER" -e "
                    pwd;
                    ls -la;
                    cd /;
                    pwd;
                    ls -la;
                    quit
                " || echo "Error in debug connection"
                '''
            }
        }

        stage('Deploy to Hostinger (Direct Method)') {
            steps {
                sh '''
                echo "🔄 Using alternative upload method..."
                
                # Create a different approach using curl/ftp
                find . -type f -not -path "*/\\.*" | while read file; do
                    if [[ "$file" == ./* ]]; then
                        # Remove leading ./
                        relative_file="${file:2}"
                    else
                        relative_file="$file"
                    fi
                    
                    if [[ -n "$relative_file" && "$relative_file" != "." && "$relative_file" != ".." ]]; then
                        # Create directory if needed
                        dir=$(dirname "$relative_file")
                        if [[ "$dir" != "." ]]; then
                            echo "Creating directory: $dir"
                            lftp -u "$FTP_USERNAME","$FTP_PASSWORD" "$FTP_SERVER" -e "
                                cd $REMOTE_DIR;
                                mkdir -p $dir;
                                quit
                            " || echo "Could not create directory $dir"
                        fi
                        
                        # Upload file
                        echo "Uploading: $file to $REMOTE_DIR/$relative_file"
                        curl -v --ftp-ssl --user "$FTP_USERNAME:$FTP_PASSWORD" \
                             --ftp-create-dirs -T "$file" \
                             "ftp://$FTP_SERVER/$REMOTE_DIR/$relative_file" || echo "Failed uploading $file"
                    fi
                done
                '''
            }
        }

        stage('Deploy to Hostinger (Fallback)') {
            steps {
                sh '''
                echo "🔄 Trying alternative FTP client (ncftp)..."
                
                # Install ncftp if not available
                if ! command -v ncftp > /dev/null 2>&1; then
                    apt-get update && apt-get install -y ncftp || yum install -y ncftp || echo "Could not install ncftp"
                fi
                
                if command -v ncftp > /dev/null 2>&1; then
                    # Create a temporary password file for ncftp
                    echo "$FTP_PASSWORD" > ncftp_password.txt
                    
                    # Try using ncftp as an alternative
                    ncftp -u "$FTP_USERNAME" -p "$FTP_PASSWORD" "$FTP_SERVER" << EOF
                    cd $REMOTE_DIR
                    lcd .
                    put -R *
                    bye
                EOF
                    rm ncftp_password.txt
                else
                    echo "⚠️ ncftp not available, skipping fallback"
                fi
                '''
            }
        }

        stage('Verify Deployment') {
            steps {
                sh '''
                echo "🔍 Verifying files were uploaded..."
                lftp -u "$FTP_USERNAME","$FTP_PASSWORD" "$FTP_SERVER" -e "
                    cd $REMOTE_DIR;
                    ls -la;
                    find . -type f | wc -l;
                    quit
                " || echo "Could not verify file count"
                
                echo "🚀 Deployment attempts completed"
                '''
            }
        }
    }
    
    post {
        always {
            echo "💡 If files are still not visible, try these troubleshooting steps:"
            echo "1. Check if Hostinger has a different FTP host than your domain name"
            echo "2. Verify if Hostinger uses a different root directory than 'public_html'"
            echo "3. Check if FTP user has proper permissions"
            echo "4. Try a manual FTP upload with FileZilla or similar tool"
        }
    }
}