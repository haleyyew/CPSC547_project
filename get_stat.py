import json
import os

species = 0
reactions = 0
references = 0
models = 0

class NameToIdMap:
	
	def __init__(self):
		self.name_to_id_rxn = {}
		self.name_to_id_sp = {}
		
		self.multiple_sp_cnt = 0
		self.multiple_rxn_cnt = 0

	def add_species(self, species_name, species_id, filename):
		if species_name in self.name_to_id_sp:
			self.name_to_id_sp[species_name].append({species_id:filename})
			self.multiple_sp_cnt += 1
		else:
			self.name_to_id_sp[species_name] = []
			self.name_to_id_sp[species_name].append({species_id:filename})
		
	def add_reaction(self, reaction_name, reaction_id, filename):
		if reaction_name in self.name_to_id_rxn:
			self.name_to_id_rxn[reaction_name].append({reaction_id:filename})
			self.multiple_rxn_cnt += 1
		else:
			self.name_to_id_rxn[reaction_name] = []
			self.name_to_id_rxn[reaction_name].append({reaction_id:filename})


parent_dir = os.getcwd() + '/ftp.ebi.ac.uk/json/'

name_to_id = NameToIdMap()

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
				reaction_name = node['reaction_name']
				reaction_id = node['id']
				
				name_to_id.add_reaction(reaction_name, reaction_id, filename.split("BIOMD")[1])
				
			elif 'species_name' in node:
				species += 1
				species_name = node['species_name']
				species_id = node['id']
				
				name_to_id.add_species(species_name, species_id, filename.split("BIOMD")[1])
						
		print("Current count: species=",species,"reactions=",reactions,"references=",references)
	
print("multiple species name:",name_to_id.multiple_sp_cnt,"multiple reactions name:",name_to_id.multiple_rxn_cnt)
	
print(len(name_to_id.name_to_id_sp))

with open(os.path.join(parent_dir, "multiple_name_sp.json"), 'w') as outfile:
	outfile.write(json.dumps(name_to_id.name_to_id_sp, indent=4, sort_keys=True))
	
with open(os.path.join(parent_dir, "multiple_name_rxn.json"), 'w') as outfile:
	outfile.write(json.dumps(name_to_id.name_to_id_rxn, indent=4, sort_keys=True))


