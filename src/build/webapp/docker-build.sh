#!/bin/bash
#
# Copyright 2020 The Department of Interior
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#

# Run with elevated 'sudo' permissions as necessary

set -e

# If tag is not set, then set it to 'latest' as a default value.
tag=${tag:-'latest'}
artifact=geo-ai-explorer-api

([ -d target ] && rm -rf target) || true
mkdir target
cp ../../../geo-ai-explorer-api/target/$artifact.war target/$artifact.war

docker build -t terraframe/$artifact:$tag .

if [ "$RELEASE_VERSION" != "latest" ]; then
  docker tag terraframe/$artifact:$tag terraframe/$artifact:latest
fi

docker save terraframe/$artifact:$tag | gzip > target/$artifact.dimg.gz