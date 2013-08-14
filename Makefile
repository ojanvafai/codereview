.PHONY: all deps serve clean

all:
	@echo "Run 'make deps' to download dependencies."

third_party/polymer-all:
	cd third_party && git clone git://github.com/Polymer/polymer-all.git --recursive

third_party/Promises:
	cd third_party && git clone https://github.com/slightlyoff/Promises.git

deps: third_party/polymer-all third_party/Promises
	@echo "Done!"

serve:
	@python -m SimpleHTTPServer 9000

deploy:
	@../google_appengine/appcfg.py update .

clean:
	rm -rf third_party/polymer-all third_party/Promises
