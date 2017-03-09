/**
 * 需要配置的参数有{
 *     isuse                            //是否开启
 *     prefix                           //识别图片前缀 例如: icon_xx-xx_xx_xx,或者 gpicon_xx-xx_xx_xx
 *     relative_icon_path
 *     图片命名格式：                    //icon_($name:xxx-xxx-xxx 只能用中线间隔)_$width_$height_[ns(no_sprite)]_[h|a].png
 * }
 */
var fs=require("fs");
var path=require("path");
var cache_obj={};

var fgp_gpicon=fis.config.get("fgp_gpicon") || {},
    fgp_prefix=fgp_gpicon.prefix || "gpicon",
    fgp_relative_icon_path=fgp_gpicon.relative_icon_path || "i";


module.exports = function (content, file, settings) {
    // 你在此处设置你的逻辑修改文件内容 content，或者文件对象 file
    var sass_arr=[];
    var icon_obj={};
    var file_dirname=file.dirname;
    var icon_dir=path.join(file_dirname,fgp_relative_icon_path);

    var get_icon_sass=function(opt){
        opt=Object.assign({hover:false,acitve:false},opt);
        if(!opt.name || isNaN(opt.width) || isNaN(opt.height)){
            fis.log.error("name or width or height error");
        };
        var str=".gp_icon_"+opt.name+"{\n    @include icon('"+opt.name+"',resize("+opt.width+"px),resize("+opt.height+"px),"+opt.hover+","+opt.acitve+",$no_sprite:"+opt.no_sprite+",$dir:'"+fgp_relative_icon_path+"')\n}\n";
        return str;
    };
    if(fis.util.isDir(icon_dir) && fgp_gpicon && fgp_gpicon.isuse){
        var fs_readdir=fs.readdirSync(icon_dir);
        try{
            fs_readdir.forEach(function(filename){
                var str,arr,obj,wh,other, w,h;
                if((new RegExp("^"+fgp_prefix,"gi")).test(filename)){
                    str=filename.substr(0,filename.lastIndexOf("."));
                    wh=/\_(\d*x\d*)\_?/gi.exec(str);
                    if(wh && wh.length>1){
                        wh=wh[1]?wh[1].split("x"):[];
                        w=wh[0];
                        h=wh[1];;
                    }

                    obj={
                        name:str.replace(/\_[ha]$/,""),
                        width:w?w:undefined,
                        height:h?h:undefined,
                        hover:/\_h$/g.test(str)?true:false,
                        active:/\_a$/g.test(str)?true:false,
                        no_sprite:/\_ns\_/g.test(str)?true:false
                    };
                    if(!isNaN(obj.width) && !isNaN(obj.height)){
                        if(!icon_obj[str.replace(/\_[ha]$/gi,"")]){
                            icon_obj[str.replace(/\_[ha]$/gi,"")]=obj;
                        }else{
                            icon_obj[str.replace(/\_[ha]$/gi,"")]=Object.assign(icon_obj[str.replace(/\_[ha]$/,"")],obj);
                        }
                    }
                }
            });
            if((Object.keys(icon_obj)).length>0){
                sass_arr.push("/*start*/\n");
                for(var k in icon_obj){
                    if(!cache_obj[k]){//处理hover，active icon 问题
                        sass_arr.push(get_icon_sass(icon_obj[k]));
                    }
                }
                sass_arr.push("/*end*/\n");
                //这里之所以要读取sass文件内容是因为content不包含sass import 内容。
                var sass_file=fis.util.read(file.fullname);
                if(/\/\*start\*\/(.|\n)*?\/\*end\*\//gi.test(content)){
                    content=content.replace(/\/\*start\*\/(.|\n)*?\/\*end\*\//gi,"");
                    sass_file=sass_file.replace(/\/\*start\*\/(.|\n)*?\/\*end\*\//gi,"");

                }
                if(/((\@import(.|\n)*?icon\.mixin)|(\@mixin(.|\n)*?icon))/gi.test(sass_file)){
                    content=content+sass_arr.join("");
                    sass_file=sass_file+sass_arr.join("");
                }else{
                    fis.log.notice(file.fullname+":"+"没找到import icon 或者没有minix icon");
                }
                //return content 只是返回内容到 release 的文件里面，对于scss文件并没有做修改，这样没办法看到class的 name
                fis.util.write(file.fullname,sass_file);
            }
        }
        catch(e){
            console.log(e);
        }

    }
    return content;
};
