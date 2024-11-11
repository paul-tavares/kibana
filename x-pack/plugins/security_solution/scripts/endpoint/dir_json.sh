#!/usr/bin/env bash

directory="$1"

if [ -z "$directory" ]; then
  echo "Error: must pass in 1 argument representing the starting directory"
  exit 1
fi

if [ ! -d "$directory" ]; then
  echo "Error: Not a directory [$directory]";
  exit 1;
fi

root_dir=$(realpath "$directory")
max_depth=2

json="["

while IFS= read -r -d '' entry
do
  name=$(basename "$entry")
  type="directory"
  size=0
  modified=""

  if [ -f "$entry" ]; then
    type="file"
    size=$(ls -l "$entry" | awk '{print $5}')
    modified=$(date -r "$entry" -u "+%Y-%m-%dT%H:%M:%SZ")
  fi

  json+="{\"type\": \"$type\", \"name\": \"$name\", \"full_path\": \"$entry\", \"size\": $size, \"modified\": \"$modified\"},"
done <   <(find "$root_dir" -maxdepth $max_depth -type d,f -print0)


#for entry in $(find "$root_dir" -maxdepth $max_depth -type d,f); do
#done

# Remove the last comma if it exists
if [ "${json: -1}" == "," ]; then
  json="${json::${#json}-1}"
fi

json+="]"

echo "$json"

exit 0
