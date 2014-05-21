#RestClient
===============

这是一个用于快速方便的访问RESTful接口的JQuery组件

特点
----------------

1.通过更少的代码就可以生成Rest请求
2.并自动完成对象的序列化和反序列化
3.更灵活的配置管理
4.自动进行的参数替换和url转义

快速开始
----------------
    //修改默认设置
    $.rest.updateOptions({
        baseUrl:'http://localhost:8080/rest/',
        error: function(errMessage){
            alert(errMessage);
        }
    });
        
    // 发送一个GET请求到 http://localhost:8080/rest/my_resources/100
    // 请求时 url 中的id 会自动被data中的同名属性替换掉
    $.rest.get({
        url: 'my_resources/{id}',
        data: {id:100},
        success: function(data){
            alert(data.name);
        }
    });