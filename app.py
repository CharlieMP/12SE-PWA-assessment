from flask import Flask, request, render_template, redirect, url_for
from sqlalchemy import create_engine, text

app = Flask(__name__)

engine = create_engine('sqlite:///database/cyberwatch.db') #link to the cyberwatch database here

#route for index.html
@app.route('/')
def home():
    
    with engine.connect() as connection:
        # This way of connecting to the database 
        # ensures that the connection is automatically closed as soon as the function finishes
        query = text('SELECT * FROM vulnerabilities ORDER BY owasp_rank;')
        result = connection.execute(query).fetchall()

    return render_template('index.html', vulnerabilities=result)

@app.route('/incidents/<vul_id>')
def incident_page(vul_id):
    # TASK 1: Connect to the database

    # TASK 2: Fetch the Vulnerability Name for the heading (JOIN or separate query)

    # TASK 3: Fetch all Incidents linked to this vul_id, return incidents list
    
    print(vul_id) #this is a print statement to help you understand what data is being returned
    return render_template('incidents.html', vulnerability = vul_id)



app.run(debug=True, reloader_type='stat', port=5000)