import json
import os

species = 0
reactions = 0
references = 0
models = 0

parent_dir = os.getcwd() + '/ftp.ebi.ac.uk/'

for file in os.listdir(parent_dir):
    if file.endswith(".json"):
		filename = os.path.join(parent_dir, file)
		print(filename)
		data = json.load(open(filename))
		models += 1
		references += len(data['links'])
		#len(data['nodes'])
		for node in data['nodes']:
			if 'reaction_name' in node:
				reactions += 1
			elif 'species_name' in node:
				species += 1
		print("Current count: species=",species,"reactions=",reactions,"references=",references)
