all: help

help:
	@echo \'make prod\' - push to noahsug.github.io/space
	@echo \'make build\' - build index.py

build:
	python scripts/gen_index.py

prod: build
	git checkout gh-pages
	make
	git add .
	git commit -am "updated game"
	git push
	git checkout master
