#!/usr/bin/env bash
# Post-deploy smoke test. Usage: ./smoke.sh https://api.mfirst.in   (use a REAL test phone you own)
A=${1:-https://api.mfirst.in}; O="Origin: https://mfirst.in"; J="Content-Type: application/json"
echo "CORS preflight:";  curl -s -o /dev/null -w "%{http_code}\n" -X OPTIONS -H "$O" $A/api/send-otp
echo "Bad phone (expect 400):"; curl -s -X POST -H "$O" -H "$J" -d '{"phone":"123"}' $A/api/send-otp; echo
echo "Bad plan (expect 400):";  curl -s -X POST -H "$O" -H "$J" -d '{"plan":"constructor"}' $A/api/create-order; echo
echo "Order (test keys, expect id+amount 99900):"; curl -s -X POST -H "$O" -H "$J" -d '{"plan":"starter"}' $A/api/create-order; echo
echo "Real OTP: run  curl -X POST -H '$O' -H '$J' -d '{\"phone\":\"YOUR_NUMBER\"}' $A/api/send-otp  then check your phone."
