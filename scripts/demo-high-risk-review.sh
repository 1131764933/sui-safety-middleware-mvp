#!/bin/bash
set -e
echo "=== 高风险交易（需人工确认）演示 ==="

curl -s -X POST http://localhost:3000/precheck \
  -H "Content-Type: application/json" \
  -d '{"address":"0x123","amount":2000,"whitelist":["0x123"],"dailyLimit":1000}'

echo -e "\n=== 若 action=review，需先确认再执行 ==="

curl -s -X POST http://localhost:3000/approval/confirm \
  -H "Content-Type: application/json" \
  -d '{"txDigest":"review-digest","approved":true}'

curl -s -X POST http://localhost:3000/execute \
  -H "Content-Type: application/json" \
  -d '{"txDigest":"review-digest","action":"review","approved":true,"signed":true}'
