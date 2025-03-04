#\!/bin/bash

# Set function to allow unauthenticated invocations
firebase functions:update ssrtransflow20 --region=us-west1 --allow-unauthenticated

# Check if it worked
firebase functions:get --region=us-west1 ssrtransflow20
