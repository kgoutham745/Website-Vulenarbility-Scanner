let intervalID;

function getAlerts(report) {
    const site = report.site[0]['@name'];
    const alerts = report.site[0].alerts;
    let high = 0;
    let medium = 0;
    let low = 0;
    let info = 0 ;
    let falsepos = 0;

    document.getElementById("scanurl").innerHTML = site;
    document.getElementById("generated").innerHTML = report['@generated'];
    document.getElementById("finishtime").innerHTML = report['@generated'];
    document.getElementById("status").innerHTML = "FINISHED";
    document.getElementById("testsperformed").innerHTML = "13/18";
    document.getElementById("time").innerHTML = report['time'];

    document.getElementById("scanpercentage").innerHTML = "Completed: 100%";
    document.getElementById("progress").style.width = '100%';
    clearInterval(intervalID);

    const accordion = document.getElementById("accordionExample");
    let count = 0;
    alerts.forEach(ele => {
        let risk = ele.riskdesc.split(' ')[0];
        let color;
        if(risk=='High'){
            high++;
            color = 'danger';
        }
        else if(risk=='Medium'){
            medium++;
            color = 'warning';
        }
        else if(risk=='Low'){
            low++;
            color = 'info';
        }
        else if(risk=='Informational'){
            info++;
            color = 'primary';
        }
        else if(risk=='False'){
            falsepos++;
            color = 'success';
        }
        let html = `
            <div class="accordion-item mt-2 rounded shadow">
                <h2 class="accordion-header" id="heading${count}">
                <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse"
                    data-bs-target="#collapse${count}" aria-expanded="false" aria-controls="collapse${count}">
                    ${ele.name}
                    <span class="badge text-bg-${color} mx-2">${ele.riskdesc}</span>
                </button>
                </h2>
                <div id="collapse${count}" class="accordion-collapse collapse" aria-labelledby="heading${count}"
                data-bs-parent="#accordionExample">
                <div class="accordion-body">
                    <strong>Description</strong>${ele.desc}
                    <br>
                    <strong>Solution</strong>${ele.solution}
                    <br>
                    <strong>Reference</strong>${ele.reference}
                    <br>
                    <strong>Other Info</strong>${ele.otherinfo}
                </div>
                </div>
            </div>
        `
        accordion.innerHTML += html;
        count++;
    });


    document.getElementById("high").style.width = high*100/count + '%';
    document.getElementById("medium").style.width = medium*100/count + '%';
    document.getElementById("low").style.width = low*100/count + '%';
    document.getElementById("info").style.width = info*100/count + '%';
    document.getElementById("false").style.width = falsepos*100/count + '%';
}

document.getElementById('scanBtn').addEventListener('click', () => {
    let url;
    try{
        url = new URL(document.getElementById("url").value);
        document.getElementById('launchModalBtn').click();
      }
      catch(err){
        alert("invalid url");
        return;
    }
    // getAlerts();
    document.getElementById("starttime").innerHTML = new Date().toString().slice(0,24);
    let i = 1;
    intervalID = setInterval(() => {
        document.getElementById("scanpercentage").innerHTML = "Scanning: " + i + '%';
        document.getElementById("progress").style.width = i + '%';
        i++;
        if(i>100) clearInterval(intervalID);
    }, 1000);
    url = document.getElementById("url").value;
    document.getElementById("scanurl").innerHTML = url;
    //get open ports
    fetch(`http://127.0.0.1:5000/ports?url=${url}`)
    .then(res=>res.json())
    .then(json=>{
        const ports = document.getElementById("ports");
        ports.innerHTML = "";
        for(var key in json){
            let color;
            if(json[key]=='open')
                color = 'danger';
            else if(json[key]=='closed')
                color = 'success';
            else
                color = 'warning';
            let html = `
                <li class="list-group-item text-secondary d-flex justify-content-between align-items-center">
                    Port Number: ${key}
                    <span class="badge bg-${color} rounded-pill">${json[key]}</span>
                </li>    
            `;
            ports.innerHTML += html;
        }
    });

    //get http methods
    fetch(`http://127.0.0.1:5000/httpmethods?url=${url}`)
    .then(res=>res.json())
    .then(json=>{
        const httpmethods = document.getElementById("httpmethods");
        httpmethods.innerHTML = "";
        console.log(json);
        for(var key in json){
            let arr = json[key].split(' ');
            let status = arr[0];
            let str = "";
            for(let i=1;i<arr.length;i++)
                str += arr[i] + " ";
            let color;
            if(str=='OK')
                color = 'danger';
            else
                color = 'warning';
            let html = `
                <li class="list-group-item text-secondary">
                    ${key}<span class="badge text-bg-${color} mx-3">${status}</span>${str}
                </li>  
            `;
            httpmethods.innerHTML += html;
        }
    });

    //header info
    fetch(`http://127.0.0.1:5000/headers?url=${url}`)
    .then(res=>res.json())
    .then(json=>{
        const headers = document.getElementById("headers");
        headers.innerHTML = "";
        console.log(json);
        for(var key in json){
            let html = `
                <dt class="col-sm-4">${key}</dt>
                <dd class="col-sm-8">${json[key]}</dd>  
            `;
            headers.innerHTML += html;
        }
    });

    //alerts
    fetch(`http://127.0.0.1:5000/alerts?url=${url}`)
    .then(res=>res.json())
    .then(json=>{
        getAlerts(json)
    }).catch(err=>{
        console.log(err);
    });
});
