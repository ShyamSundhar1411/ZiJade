from django.shortcuts import render
from django.contrib.auth.models import User
from django.contrib.auth.hashers import make_password
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from rest_framework.decorators import api_view,permission_classes
from rest_framework.permissions import IsAuthenticated,IsAdminUser
from rest_framework.response import Response
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework import status
from . serializers import ProductSerializer,UserSerializer,UserSerializerWithToken
from . models import Product,Review

# Create your views here.
#Class Based Views
class CustomTokenPairSerializer(TokenObtainPairSerializer):
    def validate(self,attrs):
        data = super().validate(attrs)
        serializer = UserSerializerWithToken(self.user).data
        for i,v in serializer.items():
            data[i] = v
        return data
class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenPairSerializer
#Function Based Views
@api_view(['POST'])
def registerUser(request):
    data = request.data
    try:
        user = User.objects.create(
            first_name = data['name'],
            username = data['email'],
            email = data['email'],
            password = make_password(data['password'])
            )
        serializer = UserSerializerWithToken(user,many = False)
        return Response(serializer.data)
    except:
        message = {'detail':'User with this email already exists'}
        return Response(message,status = status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAdminUser])
def getUsers(request):
    users = User.objects.all()
    serializer = UserSerializer(users,many = True)
    return Response(serializer.data)
@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def UpdateUserProfile(request):
    user = request.user
    serializer = UserSerializerWithToken(user,many = False)
    data = request.data
    user.first_name = data['name']
    user.username = data['email']
    user.email = data['email']
    if data['password'] != '':
        user.password = make_password(data['password'])
    user.save()
    return Response(serializer.data)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def getUserProfile(request):
    user = request.user
    serializer = UserSerializer(user,many = False)
    return Response(serializer.data)
@api_view(['GET'])
def getRoutes(request):
    routes = [
        '/api/products',
        '/api/users',
        '/api/products/<id>',
        '/api/products/reviews',
        '/api/products/top',
        '/api/products/<id>/update',
        '/api/products/<id>/delete',
        '/api/products/create',
        '/api/products/upload',
        '/api/users/register'
        '/api/users/login',
        '/api/users/profile/',
    ]
    return Response(routes)
@api_view(['GET'])
def getProducts(request):
    query = request.query_params.get('keyword')
    if query == None:
        query = ''
    products = Product.objects.filter(name__icontains=query)
    page = request.query_params.get('page')
    paginator = Paginator(products,4)
    try:
        products = paginator.page(page)
    except PageNotAnInteger:
        products = paginator.page(1)
    except EmptyPage:
        products = paginator.page(paginator.num_pages)
    if page == None:
        page = 1
    page = int(page)
    serializer = ProductSerializer(products, many = True)
    return Response({'products':serializer.data,'page':page,'pages':paginator.num_pages})
@api_view(['GET'])
def getProduct(request,pk):
    product = Product.objects.get(_id = pk)
    serializer = ProductSerializer(product,many = False)
    return Response(serializer.data)
@api_view(['POST'])
@permission_classes([IsAdminUser])
def createProduct(request):
    user = request.user
    product = Product.objects.create(
        user = user,
        name = 'Sample',
        price = 0,
        brand = 'Sample',
        countInStock = 0,
        category = 'Sample',
        description = 'Sample',
        )
    serializer = ProductSerializer(product,many = False)
    return Response(serializer.data)

@api_view(['PUT'])
@permission_classes([IsAdminUser])
def UpdateProduct(request,pk):
    product = Product.objects.get(_id=pk)
    data = request.data
    print(data)
    product.name = data['name']
    product.price = data['price']
    product.brand = data['brand']
    product.countInStock = data['countInStock']
    product.category = data['category']
    product.description = data['description']
    product.save()
    serializer = ProductSerializer(product,many = False)
    return Response(serializer.data)

@api_view(['DELETE'])
@permission_classes([IsAdminUser])
def deleteProduct(request,pk):
    product = Product.objects.get(_id=pk)
    product.delete()
    return Response("Product was deleted")
@api_view(['POST'])
def uploadImage(request):
    data = request.data
    product_id = data['product_id']
    product = Product.objects.get(_id = product_id)
    product.image = request.FILES.get('image')
    product.save()
    return Response("Image was Uploaded")

@api_view(['DELETE'])
@permission_classes([IsAdminUser])
def deleteUser(request,pk):
    user = User.objects.get(id=pk)
    user.delete()
    return Response("User was deleted")
@api_view(["GET"])
@permission_classes([IsAdminUser])
def getUserById(request,pk):
    user = User.objects.get(id=pk)
    serializer = UserSerializer(user,many = False)
    return Response(serializer.data)
@api_view(['PUT'])
@permission_classes([IsAdminUser])
def updateUser(request,pk):
    user = User.objects.get(id=pk)
    data = request.data
    user.first_name = data['name']
    user.username = data['email']
    user.email = data['email']
    user.is_staff = data['isAdmin']
    user.save()
    serializer = UserSerializer(user,many = False)
    return Response(serializer.data)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def createReview(request,pk):
    product = Product.objects.get(_id = pk)
    user = request.user
    data = request.data
    alreadyExist = product.review_set.filter(user=user).exists()
    if alreadyExist:
        content = {"detail":"Product Already Reviewed"}
        return Response(content,status = status.HTTP_400_BAD_REQUEST)
    elif data['rating'] == 0:
        content = {"detail":"Please select a rating"}
        return Response(content,status = status.HTTP_400_BAD_REQUEST)
    else:
        review = Review.objects.create(
            user = user,
            product = product,
            name = user.first_name,
            rating = data['rating'],
            comment = data['comment']
        )
        reviews = product.review_set.all()
        product.numReviews = len(reviews)
        total = 0
        for i in reviews:
            total += i.rating
        product.rating = total/len(reviews)
        product.save()
        return Response("Review Added")
@api_view(['GET'])
def topProducts(request):
    products = Product.objects.filter(rating__gte = 4).order_by('-rating')[0:5]
    serializer = ProductSerializer(products,many = True)
    return Response(serializer.data)
