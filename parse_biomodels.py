from xml.dom import minidom
import json
import os

REACTANT = 'reactant'
PRODUCT = 'product'
MODIFIER = 'modifier'

class Model:

	def __init__(self):
		self.data = {}
		self.data['nodes'] = []
		self.data['links'] = []
		return
	
	# Can merge 2 nodes of the same species from different reactions	
	def add_species(self, species_id, species_name, compartment):	
		self.data['nodes'].append({
			'id' : species_id,
			'species_name' : species_name,
			'compartment': compartment
		})

	# Cannot merge 2 reactions together
	def add_reaction(self, reaction_id, reaction_name):
		self.data['nodes'].append({
			'id' : reaction_id,
			'reaction_name' : reaction_name,
			'reactants' : [],
			'products' : [],
			'modifiers' : []
		})
		
	def add_reference(self, reaction_id, reference_id, role):
		for reaction in self.data['nodes']:
			if reaction['id'] == reaction_id:
				if role == REACTANT:
					self.data['links'].append({
						'id' : reference_id,
						'role' : role,
						'source' : '',
						'target' : reaction_id,
						'value' : 0.0
					})	
					reaction['reactants'].append(reference_id)		
				elif role == PRODUCT:
					self.data['links'].append({
						'id' : reference_id,
						'role' : role,
						'source' : reaction_id,
						'target' : '',
						'value' : 0.0
					})			
					reaction['products'].append(reference_id)

	def extend_reference(self, reference_id, stoichiometry, species_id):
		for reference in self.data['links']:
			if reference['id'] == reference_id:
				if reference['role'] == REACTANT:
					reference['source'] = species_id
				elif reference['role'] == PRODUCT:
					reference['target'] = species_id	
				reference['value'] = stoichiometry
					
def parse_rdf(filename):
	xmldoc = minidom.parse(filename)
	description_list = xmldoc.getElementsByTagName('rdf:Description')
	print(len(description_list))

	model = Model()

	for description in description_list:
		sbml_type = description.getElementsByTagName('rdf:type')
		if len(sbml_type) > 0:
			sbml_type_value = sbml_type[0].attributes['rdf:resource'].value
			
			if sbml_type_value == 'http://identifiers.org/biomodels.vocabulary#Species':
				species_id = description.attributes['rdf:about'].value.split("#")[1] 
				species = description.getElementsByTagName('sbmlRdf:name')
				#print('Species' + species_id)
				if len(species) > 0:
					species_name = species[0].firstChild.nodeValue
				else:
					species_name = ''
				compartment = description.getElementsByTagName('sbmlRdf:inCompartment')[0].attributes['rdf:resource'].value.split("#")[1] 
				model.add_species(species_id, species_name, compartment)
				#print('Species' + species_id + species_name + compartment)
				
			if sbml_type_value == 'http://identifiers.org/biomodels.vocabulary#Reaction':
				reaction_id = description.attributes['rdf:about'].value.split("#")[1] 
				reaction = description.getElementsByTagName('sbmlRdf:name')
				
				if len(reaction) > 0 and reaction[0].firstChild != None:
					reaction_name = reaction[0].firstChild.nodeValue
				else:
					reaction_name = ''
				model.add_reaction(reaction_id, reaction_name)
				
				product_list = description.getElementsByTagName('sbmlRdf:product')
				for product in product_list:
					reference_id = product.attributes['rdf:resource'].value.split("#")[1] 
					model.add_reference(reaction_id, reference_id, PRODUCT)
				
				reactant_list = description.getElementsByTagName('sbmlRdf:reactant')
				for reactant in reactant_list:
					reference_id = reactant.attributes['rdf:resource'].value.split("#")[1] 	
					model.add_reference(reaction_id, reference_id, REACTANT)
				
	for description in description_list:
		sbml_type = description.getElementsByTagName('rdf:type')
		if len(sbml_type) > 0:
			sbml_type_value = sbml_type[0].attributes['rdf:resource'].value
				
			if sbml_type_value == 'http://identifiers.org/biomodels.vocabulary#SpeciesReference':
				reference_id = description.attributes['rdf:about'].value.split("#")[1] 
				stoichiometry = description.getElementsByTagName('sbmlRdf:stoichiometry')[0].firstChild.nodeValue
				species_id = description.getElementsByTagName('sbmlRdf:species')[0].attributes['rdf:resource'].value.split("#")[1] 
				model.extend_reference(reference_id, stoichiometry, species_id)
				#print('SpeciesReference' + reference_id + species + stoichiometry)

	type_list = {}
	for description in description_list:
		sbml_type = description.getElementsByTagName('rdf:type')
		if len(sbml_type) > 0:
			sbml_type_value = sbml_type[0].attributes['rdf:resource'].value
			
			if sbml_type_value not in type_list:
				type_list[sbml_type_value] = 1
			else:
				type_list[sbml_type_value] = type_list[sbml_type_value] + 1
							
	#for sbml_type_value in type_list:
		#print(sbml_type_value, type_list[sbml_type_value])

	print len(model.data['nodes'])
	print len(model.data['links'])

	with open(filename + '.json', 'w') as outfile:  
		json.dump(model.data, outfile)

parent_dir = os.getcwd() + '/ftp.ebi.ac.uk/'
for file in os.listdir(parent_dir):
    if file.endswith(".rdf"):
		filename = os.path.join(parent_dir, file)
		print(filename)
		parse_rdf(filename)

