all: clean
	git checkout master app
	cp -r app/ .
	rm -rf app

clean:
	-rm rf js
	-rm rf third_party
	-rm rf css
        -rm index.html
