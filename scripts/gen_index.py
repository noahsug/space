import fnmatch
import os.path
import re

excluded_files = [
  'di/*'
]

tags = []

for root, dirnames, filenames in os.walk('app/js'):
  for filename in filenames:
    path = os.path.join(root, filename)[len('app/js/'):]

    should_add = True;
    for excluded_file in excluded_files:
      if fnmatch.fnmatch(path, excluded_file):
        should_add = False;
        break
    if not should_add:
      continue

    tags.append('<script src="js/%s"></script>' % (path))


# Write index.html
index_file = open('app/index.html', 'r')
index_html = index_file.read();
index_file.close();

file_tags_pattern = re.compile('/di\.js.*?' +
                               '(<script.*</script>)' +
                               '.*?<body', re.M | re.S)

match = re.search(file_tags_pattern, index_html);
index_html = index_html.replace(match.group(1), '\n  '.join(tags));

index_file = open('app/index.html', 'w')
index_file.write(index_html);
index_file.close();

# Write test_runner.html
test_file = open('test_runner.html', 'r')
test_html = test_file.read();
test_file.close();

file_tags_pattern = re.compile('/di\.js.*?' +
                               '(<script.*</script>)' +
                               '<!-- Tests -->', re.M | re.S)

match = re.search(file_tags_pattern, test_html);
test_html = test_html.replace(match.group(1), '\n  '.join(tags));

test_file = open('app/test.html', 'w')
test_file.write(test_html);
test_file.close();
