import subprocess
import os
import requests
import socket
import threading
from queue import Queue
import time
socket.setdefaulttimeout(0.25)
print_lock = threading.Lock()

path = 'C:/Users/Goutham/Documents/projects/WebVulnerabilityScanner/server/output.json'



def getAlerts(url):
    os.chdir('C:/Program Files/OWASP/Zed Attack Proxy')
    # Define the command to start OWASP ZAP
    zap_command = 'java -jar zap.jar -cmd -quickurl ' + url + ' -quickprogress -quickout ' + path

    # Run the command and capture the output
    process = subprocess.Popen(zap_command.split(), stdout=subprocess.PIPE)
    output, error = process.communicate()

    # Print the output
    return True

def testHttpMethods(url):
    res = {}
    method_list = ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'TRACE','TEST']
    for method in method_list:
        try:
            req = requests.request(method, url, timeout=3)
            # print (method, req.status_code, req.reason) 
            res[method] = str(req.status_code) + " " + req.reason
        except:
            pass
    return res

def headerInfo(url):
    res = {}
    response = requests.head(url)
    # print("Header information for", url)
    for header in response.headers:
        # print(header, ":", response.headers[header])
        res[header] = response.headers[header]
    return res
# print(headerInfo("https://google.com"))

def getOpenPorts(target):
    res = {}
    if '://' in target:
        target = target.split('://')[1]
    t_IP = socket.gethostbyname(target)
    # print ('Starting scan on host: ', t_IP)

    def portscan(port):
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        try:
            con = s.connect((t_IP, port))
            with print_lock:
                # print(port, 'is open')
                res[port] = 'open'
            con.close()
        except:
            pass

    def threader():
        while True:
            worker = q.get()
            portscan(worker)
            q.task_done()
      
    q = Queue()
   
    for x in range(100):
        t = threading.Thread(target = threader)
        t.daemon = True
        t.start()
   
    for worker in range(1, 500):
        q.put(worker)
   
    q.join()
    # print('Time taken:', time.time() - startTime)

    return res

def simpleScan(url):
    startTime = time.time()
    getAlerts(url)
    return time.time() - startTime
