.PHONY: all deps serve clean

all:
	@echo "Run 'make deps' to download dependencies."

third_party/polymer-all:
	cd third_party && git clone git://github.com/Polymer/polymer-all.git --recursive

deps: third_party/polymer-all
	@echo "Done!"

serve:
	@python -m SimpleHTTPServer

clean:
	rm -rf third_party/polymer-all
