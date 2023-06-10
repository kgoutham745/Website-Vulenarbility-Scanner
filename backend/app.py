from flask import Flask, jsonify, request
from flask_cors import CORS
from appfinal import *
import json
import os

app = Flask(__name__)
CORS(app)

@app.route('/ports', methods = ['GET'])
def ports():
    url = request.args.get('url')
    return getOpenPorts(url)

@app.route('/httpmethods', methods = ['GET'])
def httpmethods():
    url = request.args.get('url')
    return testHttpMethods(url)

@app.route('/headers', methods = ['GET'])
def headers():
    url = request.args.get('url')
    return headerInfo(url)

@app.route('/alerts', methods = ['GET'])
def alerts():
    url = request.args.get('url')
    t = simpleScan(url)
    os.chdir('C:/Users/Goutham/Documents/projects/WebVulnerabilityScanner/server')
    # return simpleScan(url)
    # print(os.getcwd())
    with open('output.json', 'r') as f:
        data = json.load(f)
        data['time'] = t
        return data

# driver function
if __name__ == '__main__':
	app.run(debug = True)
