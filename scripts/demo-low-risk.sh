#!/bin/bash
set -e
echo "=== 低风险交易演示 ==="

curl -s -X POST http://localhost:3000/precheck \
  -H "Content-Type: application/json" \
  -d '{"address":"0x123","amount":100,"whitelist":["0x123"],"dailyLimit":1000}'

echo -e "\n=== 执行结果：应返回 allow ==="
