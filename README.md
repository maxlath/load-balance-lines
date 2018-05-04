# load-balance-lines

Parallelize newline delimited data processing by load balancing lines between multiple processes

## Summary

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->


- [Install](#install)
- [Basic use](#basic-use)
- [Simple demo](#simple-demo)
- [Real case demo](#real-case-demo)
- [Options](#options)
  - [Number of processes](#number-of-processes)
  - [Silent](#silent)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Install
```sh
# Make the executable accessible within your project npm scripts or at ./node_modules/.bin/load-balance-lines
npm i load-balance-lines
# or globally
npm i -g load-balance-lines
```

## Basic use

Take a huge pile of data with atomic data elements separated by a newline break, typically [NDJSON](http://ndjson.org).

```sh
# Make sure your executable is... executable
chmod +x /path/to/my/executable
# and let's go!
cat data.ndjson | load-balance-lines /path/to/my/executable some args
```
or without the cat command, using [`<`](http://www.tldp.org/LDP/abs/html/io-redirection.html)
```sh
load-balance-lines /path/to/my/executable some args for the executable < data.ndjson
```

## Simple demo
see [test](https://github.com/maxlath/load-balance-lines/blob/master/test/load_balance_lines.js)

## Real case demo

For the needs of [wikidata-rank](https://github.com/maxlath/wikidata-rank), we need to parse a full [dump](https://www.wikidata.org/wiki/Wikidata:Database_download#JSON_dumps_.28recommended.29) of [Wikidata](https://wikidata.org)

* get the latest dump (currently 31G gzipped)

```sh
wget -c https://dumps.wikimedia.org/wikidatawiki/entities/latest-all.json.gz
```

* Use [nice](http://man7.org/linux/man-pages/man1/nice.1.html) to use the maximum amount of CPU possible while letting the priority to other processes
* Use [pigz](https://zlib.net/pigz/) to decompress it using threads (drop-in replacement to the single threaded gzip)

```sh
nice pigz -d < latest-all.json.gz | nice load-balance-lines /path/to/wikidata-rank/scripts/calculate_base_scores
```

## Options

### Number of processes
By default, there will be as many processes as CPU cores, but it can be modified by setting an environment variable
```sh
export LBL_PROCESSES=4 ; cat data.ndjson | load-balance-lines ./my/script
```

### Silent
By default, the load balancer logs some basic informations, those can be silenced to let the stdout free for the sub-processes
```sh
export LBL_SILENT=true ; cat data.ndjson | load-balance-lines ./my/script
```
