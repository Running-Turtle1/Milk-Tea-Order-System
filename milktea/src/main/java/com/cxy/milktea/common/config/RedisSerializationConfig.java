package com.cxy.milktea.common.config;

import com.cxy.milktea.admin.dto.AdminDTO;
import com.cxy.milktea.client.dto.UserDTO;
import com.cxy.milktea.client.dto.ProductDTO;
import com.cxy.milktea.client.dto.OrderDTO;
import com.cxy.milktea.common.response.ApiResponse;
import com.fasterxml.jackson.annotation.JsonAutoDetect;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import com.fasterxml.jackson.annotation.PropertyAccessor;
import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.*;
import com.fasterxml.jackson.databind.deser.std.StdDeserializer;
import com.fasterxml.jackson.databind.jsontype.TypeSerializer;
import com.fasterxml.jackson.databind.jsontype.impl.LaissezFaireSubTypeValidator;
import com.fasterxml.jackson.databind.module.SimpleModule;
import com.fasterxml.jackson.databind.ser.std.StdSerializer;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

/**
 * Redis序列化配置类
 */
@Configuration
public class RedisSerializationConfig {
    
    /**
     * 创建Redis JSON序列化器
     */
    public GenericJackson2JsonRedisSerializer redisJsonSerializer() {
        ObjectMapper objectMapper = createObjectMapper();
        return new GenericJackson2JsonRedisSerializer(objectMapper);
    }
    
    /**
     * 创建增强的ObjectMapper，用于序列化和反序列化
     */
    private ObjectMapper createObjectMapper() {
        ObjectMapper objectMapper = new ObjectMapper();
        
        // 设置可见性
        objectMapper.setVisibility(PropertyAccessor.ALL, JsonAutoDetect.Visibility.ANY);
        
        // 注册JavaTimeModule以支持Java 8日期时间类型
        objectMapper.registerModule(new JavaTimeModule());
        
        // 禁用日期时间作为时间戳输出
        objectMapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        
        // 添加自定义模块
        SimpleModule customModule = new SimpleModule();
        
        // 添加PageImpl和Sort序列化支持
        customModule.addSerializer(PageImpl.class, new PageSerializer());
        customModule.addDeserializer(PageImpl.class, new PageDeserializer());
        
        // 添加Sort序列化支持
        customModule.addSerializer(Sort.class, new SortSerializer());
        customModule.addDeserializer(Sort.class, new SortDeserializer());
        
        // 注册自定义模块
        objectMapper.registerModule(customModule);
        
        // 注册API响应模块
        SimpleModule apiModule = new SimpleModule();
        objectMapper.registerModule(apiModule);
        
        // 注册DTO模块
        SimpleModule dtoModule = new SimpleModule();
        objectMapper.registerModule(dtoModule);
        
        // 配置DTO类的序列化选项
        configureDTO(objectMapper);
        
        // 启用序列化和反序列化时包含类型信息，使用基于属性的方式
        objectMapper.activateDefaultTyping(
                LaissezFaireSubTypeValidator.instance,
                ObjectMapper.DefaultTyping.NON_FINAL,
                JsonTypeInfo.As.PROPERTY
        );
        
        return objectMapper;
    }
    
    /**
     * 配置DTO类的序列化选项
     */
    private void configureDTO(ObjectMapper objectMapper) {
        // 忽略未知属性，避免反序列化失败
        objectMapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
        
        // 允许空对象反序列化
        objectMapper.configure(DeserializationFeature.ACCEPT_EMPTY_STRING_AS_NULL_OBJECT, true);
        
        // 处理JSON中的空数组为null
        objectMapper.configure(DeserializationFeature.ACCEPT_EMPTY_ARRAY_AS_NULL_OBJECT, true);
        
        // 允许单值作为数组
        objectMapper.configure(DeserializationFeature.ACCEPT_SINGLE_VALUE_AS_ARRAY, true);
    }
    
    /**
     * PageImpl序列化器
     */
    @SuppressWarnings("rawtypes")
    public static class PageSerializer extends StdSerializer<PageImpl> {
        
        public PageSerializer() {
            super(PageImpl.class, false);
        }
        
        @Override
        public void serialize(PageImpl page, JsonGenerator gen, SerializerProvider provider) throws IOException {
            gen.writeStartObject();
            
            // 写入内容
            gen.writeFieldName("content");
            provider.defaultSerializeValue(page.getContent(), gen);
            
            // 写入分页信息
            gen.writeNumberField("number", page.getNumber());
            gen.writeNumberField("size", page.getSize());
            gen.writeNumberField("totalElements", page.getTotalElements());
            gen.writeNumberField("totalPages", page.getTotalPages());
            gen.writeBooleanField("first", page.isFirst());
            gen.writeBooleanField("last", page.isLast());
            gen.writeBooleanField("empty", page.isEmpty());
            
            // 写入排序信息
            gen.writeFieldName("sort");
            provider.defaultSerializeValue(page.getSort(), gen);
            
            gen.writeEndObject();
        }
        
        @Override
        public void serializeWithType(PageImpl value, JsonGenerator gen, SerializerProvider provider, 
                                     TypeSerializer typeSer) throws IOException {
            // 写入类型信息
            typeSer.writeTypePrefixForObject(value, gen);
            
            // 写入内容字段
            gen.writeFieldName("content");
            provider.defaultSerializeValue(value.getContent(), gen);
            
            // 写入分页信息
            gen.writeNumberField("number", value.getNumber());
            gen.writeNumberField("size", value.getSize());
            gen.writeNumberField("totalElements", value.getTotalElements());
            gen.writeNumberField("totalPages", value.getTotalPages());
            gen.writeBooleanField("first", value.isFirst());
            gen.writeBooleanField("last", value.isLast());
            gen.writeBooleanField("empty", value.isEmpty());
            
            // 写入排序信息
            gen.writeFieldName("sort");
            provider.defaultSerializeValue(value.getSort(), gen);
            
            // 写入类型信息结束标记
            typeSer.writeTypeSuffixForObject(value, gen);
        }
    }
    
    /**
     * PageImpl反序列化器
     */
    @SuppressWarnings("rawtypes")
    public static class PageDeserializer extends StdDeserializer<PageImpl> {
        
        public PageDeserializer() {
            super(PageImpl.class);
        }
        
        @Override
        public PageImpl deserialize(JsonParser p, DeserializationContext ctxt) throws IOException {
            JsonNode node = p.getCodec().readTree(p);
            
            // 获取内容
            List<?> content = new ArrayList<>();
            if (node.has("content")) {
                JsonParser contentParser = node.get("content").traverse(p.getCodec());
                contentParser.nextToken();
                content = ctxt.readValue(contentParser, ctxt.getTypeFactory().constructCollectionType(List.class, Object.class));
            }
            
            // 获取分页信息
            int number = node.has("number") ? node.get("number").asInt() : 0;
            int size = node.has("size") ? node.get("size").asInt() : content.size();
            size = size == 0 ? 1 : size; // 确保size不为0
            long totalElements = node.has("totalElements") ? node.get("totalElements").asLong() : content.size();
            
            // 获取排序信息
            Sort sort = Sort.unsorted();
            if (node.has("sort") && !node.get("sort").isNull()) {
                try {
                    JsonParser sortParser = node.get("sort").traverse(p.getCodec());
                    sortParser.nextToken();
                    sort = ctxt.readValue(sortParser, Sort.class);
                } catch (Exception e) {
                    // 捕获异常时使用默认排序
                    sort = Sort.unsorted();
                }
            }
            
            // 创建PageRequest
            PageRequest pageable = PageRequest.of(number, size, sort);
            
            // 创建并返回PageImpl
            return new PageImpl<>(content, pageable, totalElements);
        }
    }
    
    /**
     * Sort序列化器
     */
    public static class SortSerializer extends StdSerializer<Sort> {
        
        public SortSerializer() {
            super(Sort.class);
        }
        
        @Override
        public void serialize(Sort sort, JsonGenerator gen, SerializerProvider provider) throws IOException {
            gen.writeStartObject();
            
            gen.writeBooleanField("empty", sort.isEmpty());
            
            gen.writeArrayFieldStart("orders");
            for (Sort.Order order : sort) {
                gen.writeStartObject();
                gen.writeStringField("property", order.getProperty());
                gen.writeStringField("direction", order.getDirection().name());
                gen.writeBooleanField("ignoreCase", order.isIgnoreCase());
                gen.writeStringField("nullHandling", order.getNullHandling().name());
                gen.writeEndObject();
            }
            gen.writeEndArray();
            
            gen.writeEndObject();
        }
        
        @Override
        public void serializeWithType(Sort value, JsonGenerator gen, SerializerProvider provider, 
                                    TypeSerializer typeSer) throws IOException {
            typeSer.writeTypePrefixForObject(value, gen);
            
            gen.writeBooleanField("empty", value.isEmpty());
            
            gen.writeArrayFieldStart("orders");
            for (Sort.Order order : value) {
                gen.writeStartObject();
                gen.writeStringField("property", order.getProperty());
                gen.writeStringField("direction", order.getDirection().name());
                gen.writeBooleanField("ignoreCase", order.isIgnoreCase());
                gen.writeStringField("nullHandling", order.getNullHandling().name());
                gen.writeEndObject();
            }
            gen.writeEndArray();
            
            typeSer.writeTypeSuffixForObject(value, gen);
        }
    }
    
    /**
     * Sort反序列化器
     */
    public static class SortDeserializer extends StdDeserializer<Sort> {
        
        public SortDeserializer() {
            super(Sort.class);
        }
        
        @Override
        public Sort deserialize(JsonParser p, DeserializationContext ctxt) throws IOException {
            JsonNode node = p.getCodec().readTree(p);
            
            // 如果为空，返回未排序
            if (node.has("empty") && node.get("empty").asBoolean()) {
                return Sort.unsorted();
            }
            
            // 读取排序顺序
            if (node.has("orders") && node.get("orders").isArray()) {
                JsonNode orders = node.get("orders");
                if (orders.isEmpty()) {
                    return Sort.unsorted();
                }
                
                List<Sort.Order> orderList = new ArrayList<>();
                for (JsonNode orderNode : orders) {
                    String property = orderNode.has("property") ? orderNode.get("property").asText() : "";
                    String direction = orderNode.has("direction") ? orderNode.get("direction").asText() : "ASC";
                    boolean ignoreCase = orderNode.has("ignoreCase") && orderNode.get("ignoreCase").asBoolean();
                    String nullHandlingStr = orderNode.has("nullHandling") ? 
                            orderNode.get("nullHandling").asText() : "NATIVE";
                    
                    Sort.Direction dir = Sort.Direction.valueOf(direction);
                    Sort.NullHandling nullHandling = Sort.NullHandling.valueOf(nullHandlingStr);
                    
                    Sort.Order order = new Sort.Order(dir, property, nullHandling);
                    if (ignoreCase) {
                        order = order.ignoreCase();
                    }
                    orderList.add(order);
                }
                
                return Sort.by(orderList);
            }
            
            return Sort.unsorted();
        }
    }
} 