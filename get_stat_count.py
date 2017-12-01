import json
import os

def initialize_model_dict(model_lookup, model_id):
	model = {}
	model["multiple_rxn"] = {}
	model["multiple_sp"] = {}
	model_lookup[model_id] = model
	
	return model


def add_reaction_to_model(model_lookup, model_id, reaction):
	model_lookup[model_id]["multiple_rxn"][reaction] = 1
	
def add_species_to_model(model_lookup, model_id, species):
	model_lookup[model_id]["multiple_sp"][species] = 1
	

multiple_rxn_cnt = 0
multiple_sp_cnt = 0
model_lookup = {}

parent_dir = os.getcwd()

for file in os.listdir(parent_dir):
	filename = os.path.join(parent_dir, ("stat.json"))
	data = json.load(open(filename))
	for reaction in data['reaction']:
		if len(data['reaction'][reaction]) > 1:
			multiple_rxn_cnt += 1
			for model_id in data['reaction'][reaction]:
				if model_id not in model_lookup:
					model_dict = initialize_model_dict(model_lookup, model_id)
				add_reaction_to_model(model_lookup, model_id, reaction)
				
	for species in data['species']:
		if len(data['species'][species]) > 1:
			multiple_sp_cnt += 1
			for model_id in data['species'][species]:
				if model_id not in model_lookup:
					model_dict = initialize_model_dict(model_lookup, model_id)
				add_species_to_model(model_lookup, model_id, species)

with open(os.path.join(parent_dir, "multiple_id.json"), 'w') as outfile:
	outfile.write(json.dumps(model_lookup, indent=4, sort_keys=True))
	
print("multiple_rxn_cnt ", multiple_rxn_cnt, "multiple_sp_cnt ", multiple_sp_cnt)
print("model_lookup cnt", len(model_lookup))
										
