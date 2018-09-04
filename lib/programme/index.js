//函数式编程
//核心：函数式编程  必须为纯函数 不能有副作用 并且只是一个管道 进去一个值，出来一个新的值，没有其他作用

//函数式编程有两个基本运算  合成与柯里化

//函数的合成

    const compose = function(f, g){
        return function(x){
            return f(g(x))
        };
    };
    // 结合律 摘自百度百科
    // 结合律 包含二个以上的可以结合运算子的表示式 只要算子的位置没有改变，其运算的顺序就不会对运算处理的值有影响
    // (x*y)*z = x*(y*z) = x**y*z  (a+b)+c = a+(b+c) = a+b+c
    compose(1,compose(2,3));
    //等同于
    compose(compose(1,2),3);
    //等同于
    compose(1,2,3);



// 柯里化
// 核心:将多参数函数转化成单参数

    const currying = function(x,y){
        return x+y;
    };
    const curryings = function(x){
        return function(y){
            return x+y;
        };
    };
    currying(1,2) == curryings(1)(2);


// 函子 functor
// 函子是函数式编程里面最重要的数据类型，也是基本的运算单位和功能单位
//它是一种范畴，也就是说，是一个容器，包含了值和变形关系。比较特殊的是，它的变形关系可以依次作用于每一个值，将当前容器便形成另一个容器


//函子的代码实现  任何具有map方法的数据结，都可以当作函子的实现

    class Functor {
        constructor(props){
            this.props = props;
        }
        map(f){
            return new Functor(f(this.props))
        }
    };
    var functor = new Functor(0).map(function(num){
        return num+2;
    });
    console.log(functor)//Functor {props:2}

//上面生成新的函子的时候，用了 new 命令 但是new命令是面向对象编程的标志
//函数式编程一般约定，函子有个of方法，用来生成新的容器

    Functor.of = function(props){
        return new Functor(props);
    };
    var functors = Functor.of(functor.props).map(function(num){
        return num+2;
    })
    console.log(functors)//Functor {props:4}

// Maybe函子
//函子 接受各种函数，处理容器内部的值，但是有可能是一个空值(比如null),而外部函数未必
//有处理的机制，传入空值就可能出错
//Maybe 函子就是为了解决这一类问题而设计的，其实就是在它的map方法里面设置k空值检查

    class Maybe extends Functor {
        map(f){
            return this.props ? Maybe.of(f(this.props)) : Maybe.of(null);
        }
    }
    var maybe = Maybe.of(null).map(function(num){
        return num+0;
    })//Functor(props:0)
    console.log(maybe);

//Either 函子
//条件运算 if else 是最常见的运算之一 函数式编程，使用Either函子表达
//Either 函子内部两个值 左值和右值。 右值是正常情况下使用的值，左值是右值不存在时使用 的默认值

    class Either extends Functor {
        constructor(left,right){
            super();
            this.left = left;
            this.right = right;
        }
        map(f){
            return this.right ? Either.of(this.left,f(this.right)) : Either.of(f(this.left),this.right);
        }
    }

    Either.of = function(left, right){
        return new Either(left,right);
    }
    var addOne = function(x){
        return x+1;
    }
//Either 常见的用途是提供默认值。

    var either = Either.of(5,6).map(addOne);    //Either({props:undefined,left:5,right:7})
    console.log(either)
    var eitherZero = Either.of(0,null).map(addOne);//Either({props:undefined,left:1,right:null})
    console.log(eitherZero)

//另一个用途是代替try catch,使用左值表示错误
//左值为空，就表示没有出错，否则左值会包含一个错误对象e.
//所有可能出错的运算，都可以返回一个Either函子
    var currentUser={};
    var eithers = Either.of({address:'xxxx'},currentUser.address).map(function(address){
        return address;
    })
    console.log(eithers)
    function parseJSON(json) {
        try {
            return Either.of(null,JSON.parse(json))
        } catch(e){
            return Either.of(e,null)
        }
    }

//ap函子
//函子里面包含得值，完全可能是个函数。我们可以想象这样一种情况，
//一个函子得值是数值，另一个函子得值是函数

    function addTwo (x){
        return x+2;
    };
    const A = Functor.of(2);
    const B = Functor.of(addTwo);

//有时候 我们想让函子 B内部的函数，可以使用函子A的值进行运算。这时就需要用到ap函子
//ap是applicative 的缩写
//凡是部署ap方法的函子就是ap函子

    class Ap extends Functor{
        ap(F){
            return Ap.of(this.props(F.props))
        };

    };
    Ap.of = function(props){
        return new Ap(props)
    }

    var ap = Ap.of(addTwo).ap(Maybe.of(3));//5
    console.log(ap)
//ap 函子的意义在于，对于那些多参数函数可以从多个容器之中取值。实现函子的链式操作

    function add(x){
        return function(y){
            return x+y;
        }
    }
    var apA = Ap.of(add).ap(Maybe.of(2)).ap(Maybe.of(3));//5
    console.log(apA)
//add是柯里化之后的形式 一共需要两个参数\
//通过ap函子，我们就可以实现从两个容器之间取值。因此也可以这么写
    var apB = Ap.of(add(2)).ap(Maybe.of(3))//5
    console.log(apB)
