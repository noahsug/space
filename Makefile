all: dev

dev:
	python scripts/gen_index.py

deploy: dev
	git checkout gh-pages
	make
	git add .
	git commit -am "updated game"
	git push
	git checkout master
