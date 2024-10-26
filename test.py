import re
from enum import Enum
from typing import Union

rule1 = """((age > 30 AND department = "Sales head") OR (age < 25 AND
department = 'Marketing manager')) AND (salary > 50000 OR experience >
5)"""
    

class ASTNodeType(Enum):
    OPERATOR="operator"
    OPERAND="operand"

class Operator(Enum):
    AND="AND"
    OR="OR"

    def get_operator(operator_string):
        # Attempt to match the string to an enum member
        try:
            return Operator(operator_string)
        except ValueError:
            # Handle the case if the string does not match any enum member
            return None

class OperatorValue:
    def __init__(self,field,operator,value):
        self.field=field
        self.operator=operator
        self.value=value

    def __repr__(self) -> str:
        return f"""(field={self.field},operator='{self.operator}',value={self.value})"""

class ASTNode:
    def __init__(self,type:ASTNodeType,value,left:'ASTNode'=None,right:'ASTNode'=None):
        self.type=type
        self.value=value
        self.left=left
        self.right=right

    def __repr__(self) -> str:
        return f"""(type={self.type.name},value={self.value},left={self.left},right={self.right})"""

class InvalidInputRule(Exception):
    def __init__(self,value:str):
        self.value=value
        super().__init__(self.value)

def convert_to_integer(s):
    try:
        # Try to convert the string to an integer
        return int(s)
    except ValueError:
        # If conversion fails, return None or any other appropriate default value
        return None

class ASTBuilder:

    supported_operators=["<","<=",">",">=","=","!="]

    def get_operand_node(self,ele_list:list)->ASTNode:
        cnt=len(ele_list)
        if cnt<3:
            return None
        
        field=ele_list[cnt-3]
        operator=ele_list[cnt-2]
        value=ele_list[cnt-1]

        int_value=convert_to_integer(value)
        if int_value:
            value=int_value
        elif value[0]=="'" and value[-1]=="'" and len(value)>2:
            value=value[1:-1]

        if not operator in ASTBuilder.supported_operators:
            raise Exception("Not supported operator")

        ele_list.pop()
        ele_list.pop()
        ele_list.pop()

        operator_value=OperatorValue(field=field,operator=operator,value=value)

        return ASTNode(ASTNodeType.OPERAND,value=operator_value)

    def get_left_node(self,ele_list:list,node_list:list):
        node=self.get_operand_node(ele_list)

        if node is None:
            if len(node_list)==0:
                raise InvalidInputRule("Error occured in get_left_node()")
            
            node=node_list[len(node_list)-1]
            node_list.pop()
            return node

        return node

    def get_right_node(self, ele_list:list,node_list)->ASTNode:
        node=self.get_operand_node(ele_list)

        if node is None:
            
            if len(node_list)==0:
                raise InvalidInputRule("Error occured in get_right_node()")
            
            node=node_list[len(node_list)-1]
            node_list.pop()
            return node

        return node

    def tokenize(self,rule_string:str):
        # Update regex to include single-quoted strings as a token
        rule_string=rule_string.replace('"',"'")
        pattern = r"\s*(=>|AND|OR|\(|\)|>|<|>=|<=|=|!=|'[^']*'|[a-zA-Z_][a-zA-Z0-9_]*|\d+)\s*"

        # Use re.findall to extract tokens based on the pattern
        tokens = re.findall(pattern, rule_string)

        # Strip single quotes from quoted strings
        tokens = [token if not token.startswith("'") else token for token in tokens]

        return tokens

    def build(self,rule:str)->ASTNode:
        tokens=self.tokenize(rule)

        node_list=[]
        ele_list=[]

        for ele in tokens:
            if ele=='(':
                ele_list.append(ele)
            elif ele == "AND" or ele == "OR":
                left_node=self.get_left_node(ele_list,node_list)
                operator_node=ASTNode(ASTNodeType.OPERATOR,left=left_node,value=Operator.get_operator(ele))
                node_list.append(operator_node)
            elif ele==')' and len(node_list)==0:
                left_node=self.get_left_node(ele_list,node_list)
                node_list.append(left_node)
            elif ele==')' and len(node_list)>0:
                right_node=self.get_right_node(ele_list,node_list)
                node_list[len(node_list)-1].right=right_node

                if len(ele_list)>0 and ele_list[len(ele_list)-1]=='(':
                    ele_list.pop()
                else:
                    raise InvalidInputRule("Mismatch paranthesis")
            else:
                ele_list.append(ele)

        return node_list[0]
    
    def combine_AST_node(self,node1:ASTNode,node2:ASTNode)->ASTNode:
        return ASTNode(ASTNodeType.OPERATOR,left=node1,right=node2,value=Operator.get_operator("AND"))
    
class ASTEvaluater:
    
    def perform_operation(self,operator:str,true_value,input_value):
        if operator=="=":
            return true_value==input_value
        elif operator=="!=":
            return true_value!=input_value
        elif operator=="<":
            return true_value<input_value
        elif operator=="<=":
            return true_value<=input_value
        elif operator==">":
            return true_value>input_value
        elif operator==">=":
            return true_value>=input_value
        elif operator=="AND":
            return true_value and input_value
        elif operator=="OR":
            return true_value or input_value
        else:
            raise Exception("Not supported operator")

    def execute_check(self,operator_value:OperatorValue,json_data:dict)->Union[bool,None]:
        if operator_value.field in json_data:
            value=json_data.get(operator_value.field)
            return self.perform_operation(operator_value.operator,operator_value.value,value)
        return None

    def _helper(self,node:ASTNode,json_data:dict)->Union[bool,None]:
        if node.type==ASTNodeType.OPERAND:
            return self.execute_check(node.value,json_data)
        else:
            left_check=self._helper(node.left,json_data)
            right_check=self._helper(node.right,json_data)

            if left_check is None and right_check is None:
                return None
            elif left_check is None:
                return right_check
            elif right_check is None:
                return left_check
            else:
                return self.perform_operation(node.value.value,left_check,right_check)

    def evaluate(self,root:ASTNode,json_data:dict)->bool:
        verdict=self._helper(root,json_data)

        if verdict==False:
            return False
        
        return True
    
class ASTManager:
    def __init__(self,builder:ASTBuilder,evaluater:ASTEvaluater):
        self.builder=builder
        self.evaluater=evaluater

    def create_rule(self,rule:str)->ASTNode:
        return self.builder.build(rule)
        
    def evaluate(self,rule:str,json_data:dict)->bool:
        ast_root=self.create_rule(rule)
        return self.evaluater.evaluate(ast_root,json_data)
    
    def combine_rules(self,rules:list[str]):
        nodes=[]
        for rule in rules:
            node=self.builder.build(rule)
            nodes.append(node)


        combined_ast_node=None

        for node in nodes:
            if combined_ast_node is None:
                combined_ast_node=node
            else:
                combined_ast_node=self.builder.combine_AST_node(combined_ast_node,node)
            
        return combined_ast_node
            

def test_create_rule(ast_manager:ASTManager):
    ast_node=ast_manager.create_rule("""((age > 30 AND department!='sales') OR (age < 25 AND department = 'Marketing manager'))""")
    print(ast_node)


def test_combine_rules(ast_manager:ASTManager):
    rule1="""(age > 30 AND department = "Sales head")"""
    rule2="""(age < 25 AND department = 'Marketing manager')"""
    rule3="""(salary > 50000 OR experience > 5)"""

    ast_rules=[rule1,rule2,rule3]
    ast_node=ast_manager.combine_rules(ast_rules)
    
    print(ast_node)


def test_evalute_rule(ast_manager:ASTManager):
    ast_node=ast_manager.create_rule("""((age > 30 AND department!='sales') OR (age < 25 AND department = 'Marketing manager'))""")
    data={'department':"sales"}
    verdict=ast_manager.evaluate(ast_node,data)
    
    print(verdict)



if __name__ == '__main__':


    ast_builder=ASTBuilder()
    ast_evaluater=ASTEvaluater()

    ast_manager=ASTManager(ast_builder,ast_builder)

    # test_create_rule(ast_manager)
    test_combine_rules(ast_manager)
    # test_evalute_rule(ast_manager)


            