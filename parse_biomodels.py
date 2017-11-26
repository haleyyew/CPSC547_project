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
		self.species = 0
		self.reactions = 0
		self.references = 0
		return
	
	# Can merge 2 nodes of the same species from different reactions	
	def add_species(self, species_id, species_name, compartment):	
		self.data['nodes'].append({
			'id' : species_id,
			'species_name' : species_name,
			'compartment': compartment
		})
		self.species += 1

	# Cannot merge 2 reactions together
	def add_reaction(self, reaction_id, reaction_name):
		self.data['nodes'].append({
			'id' : reaction_id,
			'reaction_name' : reaction_name,
			'reactants' : [],
			'products' : [],
			'modifiers' : []
		})
		self.reactions += 1
		
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
				elif role == MODIFIER:
					self.data['links'].append({
						'id' : reference_id,
						'role' : role,
						'source' : '',
						'target' : reaction_id,
						'value' : 0.0
					})			
					reaction['modifiers'].append(reference_id)
				self.references += 1

	def extend_reference(self, reference_id, stoichiometry, species_id):
		for reference in self.data['links']:
			if reference['id'] == reference_id:
				if reference['role'] == REACTANT:
					reference['source'] = species_id
					reference['value'] = stoichiometry
				elif reference['role'] == PRODUCT:
					reference['target'] = species_id	
					reference['value'] = stoichiometry
				elif reference['role'] == MODIFIER:
					reference['source'] = species_id	
				
					
class Stat:
	def __init__(self):
		self.stat = {}
		self.stat['species'] = {}
		self.stat['reaction'] = {}
	
	def check_species(self, species, biomodel):
		if species in self.stat['species']:
			if biomodel not in self.stat['species'][species]:
				self.stat['species'][species][biomodel] = 1
			else:
				self.stat['species'][species][biomodel] += 1
		else:
			self.stat['species'][species] = {}
			self.stat['species'][species][biomodel] = 1
			
	def check_reaction(self, reaction, biomodel):
		if reaction in self.stat['reaction']:
			if biomodel not in self.stat['reaction'][reaction]:
				self.stat['reaction'][reaction][biomodel] = 1
			else:
				self.stat['reaction'][reaction][biomodel] += 1
		else:
			self.stat['reaction'][reaction] = {}
			self.stat['reaction'][reaction][biomodel] = 1
		
	def print_stat(self):
		print("=====Species=====")
		for species in self.stat['species']:
			if len(self.stat['species'][species]) > 1:
				print("Species:", species, self.stat['species'][species])
		print("=====Reaction=====")
		for reaction in self.stat['reaction']:
			if len(self.stat['reaction'][reaction]) > 1:
				print("Reaction:", reaction, self.stat['reaction'][reaction])

def parse_rdf(filename, stat):
	xmldoc = minidom.parse(filename)
	description_list = xmldoc.getElementsByTagName('rdf:Description')
	#print(len(description_list))

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
				
				biomodel = description.attributes['rdf:about'].value.split("BIOMD")[1].split("#")[0]
				stat.check_species(species_id, biomodel)
				
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
					
				modifier_list = description.getElementsByTagName('sbmlRdf:modifier')
				for modifier in modifier_list:
					reference_id = modifier.attributes['rdf:resource'].value.split("#")[1] 
					model.add_reference(reaction_id, reference_id, MODIFIER)
					
				biomodel = description.attributes['rdf:about'].value.split("BIOMD")[1].split("#")[0]
				stat.check_reaction(reaction_id, biomodel)
				
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
				
			if sbml_type_value == 'http://identifiers.org/biomodels.vocabulary#ModifierSpeciesReference':
				reference_id = description.attributes['rdf:about'].value.split("#")[1] 
				species_id = description.getElementsByTagName('sbmlRdf:species')[0].attributes['rdf:resource'].value.split("#")[1] 
				model.extend_reference(reference_id, '', species_id)				
				

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
		#json.dump(model.data, outfile)
		outfile.write(json.dumps(model.data, indent=4, sort_keys=True))
		outfile.close()



parent_dir = os.getcwd() + '/ftp.ebi.ac.uk/'

stat = Stat()

for file in os.listdir(parent_dir):
    if file.endswith(".rdf"):
		filename = os.path.join(parent_dir, file)
		print(filename)
		parse_rdf(filename, stat)
	
with open(os.path.join(parent_dir, "stat.json"), 'w') as outfile:
	outfile.write(json.dumps(stat.stat, indent=4, sort_keys=True))
	
stat.print_stat()

