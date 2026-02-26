#!/bin/bash
set -e
echo "=== 异常回退演示 ==="

curl -s -X POST http://localhost:3000/execute \
  -H "Content-Type: application/json" \
  -d '{"txDigest":"fail-digest","action":"review","approved":false,"signed":true}'

echo -e "\n=== 结果应为 blocked（review_not_approved）==="
