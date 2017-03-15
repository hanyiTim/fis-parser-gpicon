# fis-parser-gpicon
> 该插件是在fghostpig2中配合项目中的icon.mixin使用，在fis release的时候，根据配置，对icon进行自动添加mixin到sass文件中，且进行编译。主要是用来解决手动添加icon css的繁琐操作

用法
1.在fis-conf.js中配置

```
fgp_gpicon:{
    isuse:true,      //是否开启     
    prefix:"icon"    //识别图片前缀 例如: icon_xx-xx_xx_xx,或者 gpicon_xx-xx_xx_xx
    relative_icon_path: dir        //图片相对sass的位置
}
```
2.图片明白格式为  //icon_name_wxh_[ns(no_sprite)]_[h|a].png，例如：icon_arrow_10x10.png;

```
icon -> prefix
name -> icon_name
wxh  -> width x height
ns   -> no_sprite
h    -> hover
a    -> active
```
3.sass 文件 必须应用icon.mixin 或者 有存在@mixin icon

```
//icon.mixin 代码
@import "function.mixin.scss";

@mixin icon($name: "default", $width: 15px, $height: 15px, $hover: false, $active: false, $duration: 0s , $no_sprite:false,$dir:"icon_circle_wap") {
  $sprite:"__sprite";
  @if($no_sprite){
    $sprite:"";
  }
  width: $width;
  height: $height;
  background: url(#{$dir}/#{$name}.png?#{$sprite}) 0px 0px;
  background-repeat: no-repeat;
  @if $active {
    cursor: pointer;
  }
  //@include css3(transition-duration, $duration);
  @if $hover {
    &:hover{
      background: url(#{$dir}/#{$name}_h.png?#{$sprite}) 0px 0px;
    }
  }
  @if $active {
    &:active, &.active {
      background: url(#{$dir}/#{$name}_a.png?#{$sprite}) 0px 0px;
    }
  }
}
@mixin icon_a_p($name: "default",$dir:"icon_circle_wap",$hover:true,$active:true){
  @if($hover) {
    :hover > .gp_icon_#{$name} {
      background: url(#{$dir}/#{$name}_h.png?__sprite) 0px 0px;
    }
  }
  @if($active) {
    :active > .gp_icon_#{$name}, .active > .gp_icon_#{$name} {
      background: url(#{$dir}/#{$name}_a.png?__sprite) 0px 0px;
    }
  }
}
.gp_icon {
  display: inline-block;
  overflow: hidden;
  background-repeat: no-repeat;
  //background-size:100% auto; //适应宽度 2015/8/13
}
```
