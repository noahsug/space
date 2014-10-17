import fnmatch
import os.path
import re

excluded_files = [
  'di/*'
]

impl_tags = []
test_impl_tags = []
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

    impl_tags.append('<script src="js/%s"></script>' % (path))
    test_impl_tags.append('<script src="app/js/%s"></script>' % (path))

test_tags = []
for root, dirnames, filenames in os.walk('test/js'):
  for filename in filenames:
    path = os.path.join(root, filename)
    test_tags.append('<script src="%s"></script>' % (path))


## Write index.html
index_file = open('app/index.html', 'r')
index_html = index_file.read();
index_file.close();

impl_tags_pattern = re.compile('/di\.js.*?' +
                               '(<script.*</script>)' +
                               '.*?<body', re.M | re.S)
match = re.search(impl_tags_pattern, index_html);
index_html = index_html.replace(match.group(1), '\n  '.join(impl_tags));

index_file = open('app/index.html', 'w')
index_file.write(index_html);
index_file.close();

## Write test_runner.html
test_file = open('test_runner.html', 'r')
test_html = test_file.read();
test_file.close();

# impl tags
impl_tags_pattern = re.compile('/di\.js.*?' +
                               '(<script.*</script>)' +
                               '.*<!-- Test environment -->', re.M | re.S)
match = re.search(impl_tags_pattern, test_html);
test_html = test_html.replace(match.group(1), '\n  '.join(test_impl_tags));

# test tags
test_tags_pattern = re.compile('<!-- Tests -->.*?' +
                               '(<script.*</script>)', re.M | re.S)
match = re.search(test_tags_pattern, test_html);
test_html = test_html.replace(match.group(1), '\n  '.join(test_tags));

test_file = open('test_runner.html', 'w')
test_file.write(test_html);
test_file.close();
