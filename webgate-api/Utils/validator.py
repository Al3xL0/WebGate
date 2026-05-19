from urllib.parse import parse_qs
import re 
class Validator: 
     def __init__(self): 
          pass 
     # stratgey picker
     def validate(self, body) -> bool:
          isPasswordValid, isEmailValid = True , True
          parsed = parse_qs(body.decode("utf-8", errors="replace"))
          if "email" in parsed.keys(): 
              isEmailValid = self.validateEmail(parsed["email"][0])
          if "password" in parsed.keys():
               isPasswordValid = self.validatePassword(parsed["password"][0])
          return isEmailValid and isPasswordValid
                
     # validate algorithms 
     def validateEmail(self, email:str) -> bool: 
          EMAIL_PATTERN = r"^[A-Za-z0-9.]+@[A-Za-z0-9.]+\.[A-Za-z]{2,}$"
          return re.fullmatch(EMAIL_PATTERN, email) is not None
     def validatePassword(self, password:str) -> bool:
          PASSWORD_PATTERN = r"^[A-Za-z0-9.!@#$%&*+=?]{1,128}$"
          return re.fullmatch(PASSWORD_PATTERN, password) is not None
     
     