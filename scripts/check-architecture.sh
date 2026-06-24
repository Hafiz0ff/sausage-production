#!/bin/bash

# Ensure no /api/production usage
found_api=$(grep -r "/api/production" apps/workshop-dashboard/src/ packages/api-client/src/ packages/backend-domain/src/ \
  | grep -v "/api/sausage-production" \
  | grep -v "\.test\.ts" \
  | grep -v "Forbidden sausage-production API namespace" \
  | grep -v "startsWith('/api/production')" || true)

if [ ! -z "$found_api" ]; then
  echo "Architecture Violation: Found forbidden /api/production endpoint usage:"
  echo "$found_api"
  exit 1
fi

# Ensure no Siyoma business module imports (Assuming they are something like 'siyoma-domain' or direct imports from host)
# Because it's an abstract rule, we just check for common Siyoma references.
found_siyoma=$(grep -r "siyoma" apps/workshop-dashboard/src/ packages/api-client/src/ packages/backend-domain/src/ || true)

if [ ! -z "$found_siyoma" ]; then
  echo "Architecture Violation: Found forbidden Siyoma imports:"
  echo "$found_siyoma"
  exit 1
fi

# Ensure no screen-level import of mock data in frontend
found_mock=$(grep -r "mockSausageProductionData" apps/workshop-dashboard/src/screens/ || true)
if [ ! -z "$found_mock" ]; then
  echo "Architecture Violation: Screens cannot import mock data directly:"
  echo "$found_mock"
  exit 1
fi

echo "Architecture Check Passed!"
exit 0
