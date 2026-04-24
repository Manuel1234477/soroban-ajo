#!/bin/bash

# Load Testing Script for Soroban Ajo Platform
# This script runs all load tests and generates a summary report

set -e

BASE_URL="${BASE_URL:-http://localhost:3000}"
OUTPUT_DIR="./load-tests/results"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

echo "========================================="
echo "Soroban Ajo Load Testing Suite"
echo "========================================="
echo "Base URL: $BASE_URL"
echo "Timestamp: $TIMESTAMP"
echo "========================================="

# Create output directory
mkdir -p "$OUTPUT_DIR"

# Function to run a test and capture results
run_test() {
  local test_name=$1
  local test_file=$2
  
  echo ""
  echo "Running $test_name..."
  echo "-----------------------------------"
  
  k6 run \
    -e BASE_URL="$BASE_URL" \
    --out json="$OUTPUT_DIR/${test_name}_${TIMESTAMP}.json" \
    "$test_file" \
    | tee "$OUTPUT_DIR/${test_name}_${TIMESTAMP}.log"
  
  if [ $? -eq 0 ]; then
    echo "✓ $test_name PASSED"
  else
    echo "✗ $test_name FAILED"
  fi
}

# Run all load tests
run_test "auth" "./backend/load-tests/scenarios/auth.load.test.ts"
run_test "groups" "./backend/load-tests/scenarios/groups.load.test.ts"
run_test "stress" "./backend/load-tests/scenarios/stress.load.test.ts"
run_test "spike" "./backend/load-tests/scenarios/spike.load.test.ts"

echo ""
echo "========================================="
echo "Load Testing Complete"
echo "========================================="
echo "Results saved to: $OUTPUT_DIR"
echo ""
echo "Summary:"
grep -h "✓\|✗" "$OUTPUT_DIR"/*_${TIMESTAMP}.log || true
echo "========================================="
