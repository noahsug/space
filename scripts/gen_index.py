import fnmatch
import os.path
import re

excluded_files = [
  'di/*',
]

impl_files = []
test_impl_files = []
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

    impl_files.append('<script src="js/%s"></script>' % (path))
    test_impl_files.append('<script src="app/js/%s"></script>' % (path))

test_files = []
for root, dirnames, filenames in os.walk('test/js'):
  for filename in filenames:
    path = os.path.join(root, filename)
    test_files.append('<script src="%s"></script>' % (path))

mock_files = []
for root, dirnames, filenames in os.walk('test/mock'):
  for filename in filenames:
    if not fnmatch.fnmatch(filename, 'mock_manager.js'):
      path = os.path.join(root, filename)
      mock_files.append('<script src="%s"></script>' % (path))


## Write index.html
index_file = open('app/index.html', 'r')
index_html = index_file.read();
index_file.close();

impl_files_pattern = re.compile('/di\.js.*?' +
                               '(<script.*</script>)' +
                               '.*?<body', re.M | re.S)
match = re.search(impl_files_pattern, index_html);
index_html = index_html.replace(match.group(1), '\n  '.join(impl_files));

index_file = open('app/index.html', 'w')
index_file.write(index_html);
index_file.close();

## Write test_runner.html
test_file = open('test_runner.html', 'r')
test_html = test_file.read();
test_file.close();

# test impl files
test_impl_files_pattern = re.compile('/di\.js.*?' +
                               '(<script.*</script>)' +
                               '.*<!-- Mocks -->', re.M | re.S)
match = re.search(test_impl_files_pattern, test_html);
test_html = test_html.replace(match.group(1), '\n  '.join(test_impl_files));

# mock files
mock_files_pattern = re.compile('/mock_manager\.js.*?' +
                               '(<script.*</script>)' +
                               '.*<!-- Tests -->', re.M | re.S)
match = re.search(mock_files_pattern, test_html);
test_html = test_html.replace(match.group(1), '\n  '.join(mock_files));

# test files
test_files_pattern = re.compile('/test_environment\.js.*?' +
                               '(<script.*</script>)', re.M | re.S)
match = re.search(test_files_pattern, test_html);
test_html = test_html.replace(match.group(1), '\n  '.join(test_files));

test_file = open('test_runner.html', 'w')
test_file.write(test_html);
test_file.close();
