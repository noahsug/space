all: dev

help:
	@echo \'make prod\' - push to noahsug.github.io/space

dev:
	python scripts/gen_index.py

prod: dev
	git checkout gh-pages
	make
	git add .
	git commit -am "updated game"
	git push
	git checkout master
