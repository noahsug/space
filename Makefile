all: clean
	git checkout master app
	cp -r app/ .
	rm -rf app
	cp -r overwrite/ .

clean:
	-rm rf js
	-rm rf third_party
	-rm rf css
	-rm rf assets
	-rm rf *.html
	-rm rf *.js
